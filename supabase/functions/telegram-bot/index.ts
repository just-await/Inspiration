// supabase/functions/telegram-bot/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!
const ADMIN_CHAT_ID = Deno.env.get('ADMIN_CHAT_ID')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('MY_SERVICE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

serve(async (req) => {
  try {
    const url = new URL(req.url)
    const body = await req.json().catch(() => ({}))
    
    // console.log("INCOMING:", JSON.stringify(body)) // Раскомментируй для отладки

    // =================================================================
    // 1. ОБРАБОТКА ТЕКСТОВЫХ СООБЩЕНИЙ (ПРИЧИНА ОТКАЗА ИЛИ /START)
    // =================================================================
    if (body.message) {
        const msg = body.message
        const chatId = msg.chat.id
        const text = msg.text

        // А) КОМАНДА /start
        if (text && text.startsWith('/start')) {
            const param = text.split(' ')[1]
            if (param) {
                // Привязка сессии
                const { data: quotesData } = await supabaseAdmin
                    .from('quotes')
                    .update({ telegram_id: chatId })
                    .eq('session_id', param)
                    .select()
                const count = quotesData ? quotesData.length : 0
                
                await sendTelegram(chatId, `👋 <b>Привет!</b>\n\nЯ связал твой аккаунт с твоими заявками (найдено: ${count}).\nЖди уведомлений!`)
            } else {
                await sendTelegram(chatId, `Привет! Предлагай фразы на сайте, а я буду присылать уведомления.`)
            }
            return new Response("OK")
        }

        // Б) ОБРАБОТКА ПРИЧИНЫ ОТКАЗА (Если это ответ на сообщение бота)
        // Проверяем: это реплай? Это реплай на сообщение про заявку?
        if (msg.reply_to_message && msg.reply_to_message.text && msg.reply_to_message.text.includes('Заявка #')) {
            // Парсим ID заявки из текста исходного сообщения
            const originalText = msg.reply_to_message.text
            const match = originalText.match(/Заявка #(\d+)/)
            
            if (match && match[1]) {
                const quoteId = match[1]
                const reason = text // Текст, который ввел админ

                // 1. Обновляем статус в БД
                const { data: record } = await supabaseAdmin
                    .from('quotes')
                    .update({ is_approved: false })
                    .eq('id', quoteId)
                    .select('*')
                    .single()

                if (record) {
                    // 2. Уведомляем пользователя С ПРИЧИНОЙ
                    if (record.telegram_id) {
                        const userMsg = `😔 <b>Твоя фраза отклонена</b>\n\n<i>"${record.text}"</i>\n\n<b>Причина:</b> ${reason}\n\nПопробуй исправить и предложить снова!`
                        await sendTelegram(record.telegram_id, userMsg)
                    }

                    // 3. Возвращаем админскую панель в исходный вид (Отклонено)
                    // Мы редактируем то сообщение, на которое ответили
                    const statusText = "❌ ОТКЛОНЕНО (Скрыто)"
                    const buttons = getAdminButtons(quoteId, record.contact)
                    const adminMsgText = formatAdminMessage(record, statusText)

                    await editTelegramMessage(chatId, msg.reply_to_message.message_id, adminMsgText, buttons)
                    
                    // 4. (Опционально) Подтверждаем админу, что причина принята
                    // await sendTelegram(chatId, `Причина для #${quoteId} отправлена.`)
                }
            }
            return new Response("OK")
        }
    }

    // =================================================================
    // 2. ОБРАБОТКА НАЖАТИЯ КНОПОК
    // =================================================================
    if (body.callback_query) {
      const callback = body.callback_query
      const dataParts = callback.data.split('_')
      // Формат: action_id  ИЛИ  action_subaction_id (skip_reject_123)
      
      let action, quoteId
      if (dataParts.length === 2) {
          [action, quoteId] = dataParts
      } else {
          // skip_reject_123
          action = dataParts[0] + '_' + dataParts[1]
          quoteId = dataParts[2]
      }

      const messageId = callback.message.message_id
      const chatId = callback.message.chat.id

      // Получаем цитату
      const { data: record } = await supabaseAdmin
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .single()
      
      if (!record) return new Response("OK")

      // --- ЛОГИКА КНОПОК ---

      // 1. НАЖАЛИ "ОТКЛОНИТЬ" (Первичный клик) -> Запрашиваем причину
      if (action === 'reject') {
          // Меняем текст сообщения, просим ввести причину
          const askReasonText = formatAdminMessage(record, "✍️ <b>Введи причину ОТВЕТОМ (Reply) на это сообщение</b>\nили нажми кнопку ниже")
          
          // Кнопка только одна: Не называть причину
          const skipButton = [[{ text: "🤷‍♂️ Не называть причину", callback_data: `skip_reject_${quoteId}` }]]

          await editTelegramMessage(chatId, messageId, askReasonText, skipButton)
          await answerCallback(callback.id)
          return new Response("OK")
      }

      // 2. НАЖАЛИ "НЕ НАЗЫВАТЬ ПРИЧИНУ" (Или обычное одобрение)
      let statusText = ""
      let isApproved = false

      if (action === 'approve') {
        isApproved = true
        statusText = "✅ ОДОБРЕНО (Видно на сайте)"
      } 
      if (action === 'skip_reject') { // Это "Не называть причину"
        isApproved = false
        statusText = "❌ ОТКЛОНЕНО (Скрыто)"
      }

      // Обновляем базу
      await supabaseAdmin
        .from('quotes')
        .update({ is_approved: isApproved })
        .eq('id', quoteId)

      // Уведомляем пользователя (БЕЗ ПРИЧИНЫ)
      // Шлем уведомление только если статус реально поменялся или это явное действие
      // Но чтобы не спамить при клике "Одобрить" на уже одобренное, можно добавить проверку. 
      // Пока шлем всегда для надежности.
      if (record.telegram_id) {
          let userMsg = ""
          if (isApproved) {
              userMsg = `🎉 <b>Твоя фраза одобрена!</b>\n\n<i>"${record.text}"</i>\n\nСкоро она появится в ротации на сайте.`
          } else {
              userMsg = `😔 <b>Твоя фраза отклонена</b>\n\n<i>"${record.text}"</i>\n\nПопробуй предложить другую!`
          }
          await sendTelegram(record.telegram_id, userMsg).catch(e => console.error(e))
      }

      // Возвращаем стандартные кнопки и текст
      const buttons = getAdminButtons(quoteId, record.contact)
      const finalText = formatAdminMessage(record, statusText)

      await editTelegramMessage(chatId, messageId, finalText, buttons)
      await answerCallback(callback.id, "Статус обновлен")

      return new Response("OK")
    }

    // =================================================================
    // 3. НОВАЯ ЗАЯВКА (WEBHOOK ОТ БАЗЫ)
    // =================================================================
    if (body.type === 'INSERT' && body.table === 'quotes') {
      const record = body.record
      
      const messageText = formatAdminMessage(record, "⏳ <b>Ожидает решения</b>")
      const buttons = getAdminButtons(record.id, record.contact)

      await sendTelegram(ADMIN_CHAT_ID, messageText, buttons)
      return new Response("OK")
    }

    return new Response("OK")

  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

// Генерация текста сообщения админа
function formatAdminMessage(record: any, status: string) {
    return `📝 <b>Заявка #${record.id}</b>\n\n` +
           `<code>${record.text}</code>\n\n` +
           `Автор: <b>${record.author}</b>\n` +
           `Статус: ${status}`
}

// Генерация стандартных кнопок
function getAdminButtons(quoteId: any, contact: any) {
    const inlineKeyboard = [
        [
            { text: "✅ Одобрить", callback_data: `approve_${quoteId}` },
            { text: "❌ Отклонить", callback_data: `reject_${quoteId}` }
        ]
    ]
    if (contact) {
        inlineKeyboard.push([
            { text: `✈️ ЛС @${contact}`, url: `https://t.me/${contact}` }
        ])
    }
    return inlineKeyboard
}

// Отправка сообщения
async function sendTelegram(chatId: any, text: string, buttons: any = null) {
    const body: any = {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
    }
    if (buttons) body.reply_markup = { inline_keyboard: buttons }

    return await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
}

// Редактирование сообщения
async function editTelegramMessage(chatId: any, messageId: any, text: string, buttons: any) {
    return await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text: text,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: buttons }
        })
    })
}

// Ответ на нажатие кнопки (чтобы часики пропали)
async function answerCallback(callbackId: any, text: string = "") {
    return await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callbackId, text: text })
    })
}