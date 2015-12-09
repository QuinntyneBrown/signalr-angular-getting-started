using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(angular_signalr_getting_started.Startup))]

namespace angular_signalr_getting_started
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.MapSignalR();
        }
    }
}
