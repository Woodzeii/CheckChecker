using Xunit;
using backend;
using System.Net;
using Respawn;
using System.Net.Http.Json;
namespace backend.api.tests;

public abstract class BaseIntegrationTest : IClassFixture<CustomWebApplicationFactory>, IAsyncLifetime
{
    // protected - видны в наследниках. Оно нам надо.
    protected readonly CustomWebApplicationFactory Factory;
    protected readonly HttpClient Client;

    protected BaseIntegrationTest(CustomWebApplicationFactory factory)
    {
        Factory = factory;
        Client = factory.CreateClient();
    }

    // Этот метод автоматически сбросит базу перед КАЖДЫМ тестом в любом наследнике
    public async Task InitializeAsync()
    {
        await Factory.ResetDatabaseAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;
}


