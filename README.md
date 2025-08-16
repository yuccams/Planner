# Task Planner

A modern, feature-rich task management application built with .NET Core and Razor Pages.

## Features

- ✅ **Add/Remove Tasks**: Create and delete tasks with ease
- ✅ **Mark Tasks as Completed**: Toggle task completion status
- ✅ **Task Properties**: Each task contains Name, Description, and Due Date
- ✅ **File-based Storage**: JSON storage for simplicity and portability
- ✅ **Localization**: Full support for English (EN) and Ukrainian (UA) languages
- ✅ **Modern UI**: Clean, responsive design with Bootstrap 5
- ✅ **Search & Filter**: Find tasks quickly with search and status filtering
- ✅ **Sort Options**: Sort tasks by creation date, due date, or name
- ✅ **Responsive Design**: Works perfectly on desktop and mobile devices

## Technology Stack

- **.NET 8.0**: Latest .NET framework
- **ASP.NET Core**: Web application framework
- **Razor Pages**: Server-side rendering with clean separation of concerns
- **Bootstrap 5**: Modern, responsive UI framework
- **Font Awesome**: Beautiful icons
- **JSON Storage**: Simple file-based data persistence
- **Localization**: Built-in support for multiple languages

## Project Structure

```
TaskPlanner/
├── Models/
│   └── Task.cs                 # Task entity model
├── Services/
│   ├── ITaskService.cs         # Task service interface
│   └── TaskService.cs          # Task service implementation
├── Pages/
│   ├── Index.cshtml            # Main task list page
│   ├── Index.cshtml.cs         # Main page model
│   ├── Privacy.cshtml          # Privacy policy page
│   ├── Privacy.cshtml.cs       # Privacy page model
│   └── Tasks/
│       ├── Create.cshtml       # Create task form
│       ├── Create.cshtml.cs    # Create page model
│       ├── Edit.cshtml         # Edit task form
│       └── Edit.cshtml.cs      # Edit page model
├── Resources/
│   ├── SharedResource.en.resx  # English localization
│   └── SharedResource.uk.resx  # Ukrainian localization
├── wwwroot/
│   ├── css/
│   │   └── site.css           # Custom styles
│   └── js/
│       └── site.js            # Custom JavaScript
├── Program.cs                  # Application entry point
└── TaskPlanner.csproj         # Project file
```

## Getting Started

### Prerequisites

- .NET 8.0 SDK or later
- Any modern web browser

### Installation

1. Clone or download the project
2. Navigate to the project directory
3. Run the application:

```bash
dotnet run
```

4. Open your browser and navigate to `https://localhost:5001` or `http://localhost:5000`

### Usage

1. **Create Tasks**: Click "Add New Task" to create a new task
2. **Edit Tasks**: Click the edit icon on any task to modify it
3. **Complete Tasks**: Click the circle icon to mark tasks as completed
4. **Delete Tasks**: Click the trash icon to remove tasks
5. **Search & Filter**: Use the search bar and filters to find specific tasks
6. **Change Language**: Use the language dropdown in the navigation bar

## Features in Detail

### Task Management
- Create tasks with name, description, and due date
- Edit existing tasks
- Mark tasks as completed/incomplete
- Delete tasks with confirmation
- Visual indicators for overdue tasks

### User Interface
- Clean, modern design with Bootstrap 5
- Responsive layout for all device sizes
- Smooth animations and transitions
- Intuitive icons and visual feedback
- Dark/light theme support

### Data Storage
- JSON file-based storage in `Data/tasks.json`
- No database required
- Data persists between application restarts
- Automatic backup and error handling

### Localization
- English (EN) and Ukrainian (UA) support
- Dynamic language switching
- Culturally appropriate date formatting
- Complete UI translation

### Search & Filtering
- Real-time search by task name
- Filter by completion status (All/Pending/Completed)
- Sort by creation date, due date, or name
- Client-side filtering for instant results

## Customization

### Adding New Languages

1. Create a new resource file: `Resources/SharedResource.{culture}.resx`
2. Add translations for all keys
3. Update `Program.cs` to include the new culture

### Styling

The application uses custom CSS in `wwwroot/css/site.css`. You can modify:
- Color scheme
- Typography
- Layout spacing
- Animation effects

### Data Storage

The application uses JSON storage by default. You can extend the `ITaskService` interface to support:
- Database storage (SQL Server, PostgreSQL, etc.)
- Cloud storage (Azure, AWS, etc.)
- API-based storage

## Development

### Building the Project

```bash
dotnet build
```

### Running Tests

```bash
dotnet test
```

### Publishing

```bash
dotnet publish -c Release
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For questions or issues, please create an issue in the repository.

---

**Built with ❤️ using .NET Core and Razor Pages** 