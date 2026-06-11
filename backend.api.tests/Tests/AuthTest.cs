using Xunit;
using System.Net;
using backend;
using System.Net.Http.Json;

namespace backend.api.tests;
public class AuthTest : BaseIntegrationTest
{
    public AuthTest(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task RegisterTest()
    {
        RegisterRequest regReq = new RegisterRequest
        {
            Login = "testuser",
            Password = "testpassword",
            Name = "Test User"
        };
        var response = await Client.PostAsJsonAsync("/api/auth/register", regReq);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
    
    [Fact] 
    public async Task RegisterWithExistingLoginTest()
    {
        //сначала регаем
        RegisterRequest regReq = new RegisterRequest
        {
            Login = "testuser",
            Password = "testpassword",
            Name = "Test User"
        };
        await Client.PostAsJsonAsync("/api/auth/register", regReq);
        //потом пытаемся зарегать того же юзера
        var response = await Client.PostAsJsonAsync("/api/auth/register", regReq);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task LoginTest()
    {
        //сначала регаем
        RegisterRequest regReq = new RegisterRequest
        {
            Login = "testuser",
            Password = "testpassword",
            Name = "Test User"
        };
        await Client.PostAsJsonAsync("/api/auth/register", regReq);
        //потом логинимся
        LoginRequest loginReq = new LoginRequest
        {
            Login = "testuser",
            Password = "testpassword"
        };
        var response = await Client.PostAsJsonAsync("/api/auth/login", loginReq);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task LoginWithWrongPasswordTest()
    {
        //сначала регаем
        RegisterRequest regReq = new RegisterRequest
        {
            Login = "testuser",
            Password = "testpassword",
            Name = "Test User"
        };
        await Client.PostAsJsonAsync("/api/auth/register", regReq);
        //потом логинимся с неправильным паролем
        LoginRequest loginReq = new LoginRequest
        {
            Login = "testuser",
            Password = "wrongpassword"
        };
        var response = await Client.PostAsJsonAsync("/api/auth/login", loginReq);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}