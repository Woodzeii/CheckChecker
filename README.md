# CheckChecker

Приложение для учёта расходов по чекам. Backend на ASP.NET Core,
 frontend на Next.js. Сервис получает данные чеков,
 сохраняет их в базу и автоматически категоризирует позиции с помощью LLM.

## Стек

- Backend: .NET / ASP.NET Core Web API
- ORM: Entity Framework Core
- База данных: (укажите, что используете — например, PostgreSQL или SQLite)
- Frontend: Next.js (React), директория `frontend/`
- Аутентификация: JWT

## Конфигурация `appsettings.Development.json`

Файл `appsettings.Development.json` **не хранится в репозитории** и намеренно не коммитится, чтобы не светить секретные ключи и токены. Каждый разработчик должен создать его локально.

1. В папке `backend` создайте файл `appsettings.Development.json`.
2. Скопируйте в него шаблон:

   ```json
   {
     "Logging": {
       "LogLevel": {
         "Default": "Information",
         "Microsoft.AspNetCore": "Warning"
       }
     },
     
     "Proverkacheka": {
       "token": "GetAndEnterYourTokenOnThisSite"
     },
     "Jwt": {
       "Key": "EnterYourPasswordWordForSecureHashOfPassword"
     },
     
     "OpenRouter": {
       "ApiKey": "EnterYourApiKey"	
       "Model": "arcee-ai/trinity-large-preview:free"
     }
   }
3. Заполните значения:

"Proverkacheka:token" — ваш токен с сайта проверки чеков.

"Jwt:Key" — секретный ключ для подписи JWT (длинная случайная строка).

"OpenRouter:ApiKey" — ваш API‑ключ OpenRouter.

Убедитесь, что appsettings.Development.json добавлен в .gitignore, чтобы он не попал в репозиторий.

Запуск backend
cd backend
dotnet ef database update   # применить миграции
dotnet run                  # запустить API
После запуска backend обычно доступен по адресу https://localhost:5001 или https://localhost:7113 (уточните актуальный URL/порт в launchSettings.json).

Запуск frontend
cd frontend
npm install
npm run dev
По умолчанию frontend поднимается на http://localhost:3000 и ходит в backend по настроенному в коде/конфиге адресу API. Убедитесь, что backend запущен, прежде чем открывать frontend.