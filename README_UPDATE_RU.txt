СЕТ 0.9.1 — облачная конфигурация Supabase

Проект setlog создан, таблица и политики применены. Этот пакет уже содержит Project URL и публичный publishable key.

До публикации:
1. Сохрани JSON-экспорт истории на телефоне.
2. Открой Supabase Auth → URL Configuration:
   Site URL = https://sktkuzma.github.io/setlog/
   Redirect URLs включает https://sktkuzma.github.io/setlog/
3. Убедись, что Email provider включён.
4. Важно: встроенный Supabase SMTP по умолчанию отправляет письма только участникам команды; для друзей потребуется настроить собственный SMTP.
5. Загрузи все файлы из корня архива в корень GitHub-репозитория и создай commit в main.
6. Проверь регистрацию, перенос данных, историю, синхронизацию и замену упражнения.

Не загружай service_role/secret key, пароль базы или SMTP-пароль в GitHub.
Версия: 0.9.1
Схема данных: v6
Service worker cache: v11
