using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace angular_signalr_getting_started
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "default",
                url: "{*catch-all}",
                defaults: new { controller = "Default", action = "Index", urlAlias = UrlParameter.Optional }
            );
        }
    }
}