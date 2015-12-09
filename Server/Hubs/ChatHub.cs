using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;

namespace angular_signalr_getting_started.Hubs
{
    [HubName("chatHub")]
    public class ChatHub : Hub
    {
        public void Send(string username, string message)
        {
            Clients.All.broadcastMessage(new { username = username, message = message });
        }
    }
}