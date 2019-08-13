package main

import (
	"net/http"
	"os"

	"github.com/byuoitav/central-event-system/hub/base"
	"github.com/byuoitav/central-event-system/messenger"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/v2/auth"
	"github.com/byuoitav/configuration-database-tool/handlers"
	"github.com/byuoitav/configuration-database-tool/socket"
	"github.com/jessemillar/health"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

func main() {
	mess, err := messenger.BuildMessenger(os.Getenv("HUB_ADDRESS"), base.Messenger, 1000)
	if err != nil {

	}

	handlers.SetMessenger(mess)

	go handlers.WriteEventsToSocket()

	port := ":9900"
	router := echo.New()
	router.Pre(middleware.RemoveTrailingSlash())
	router.Use(middleware.CORS())

	// websocket
	router.GET("/websocket", func(context echo.Context) error {
		socket.ServeWebsocket(context.Response().Writer, context.Request())
		return nil
	})

	handlers.Dev = true

	// Use the `secure` routing group to require authentication
	// secure := router.Group("", echo.WrapMiddleware(authmiddleware.Authenticate))

	// if !handlers.Dev {
	// secure := router.Group("", auth.CheckHeaderBasedAuth)
	// }

	writeconfig := router.Group(
		"",
		auth.CheckHeaderBasedAuth,
		// echo.WrapMiddleware(auth.AuthenticateCASUser),
		auth.AuthorizeRequest("write-config", "configuration", func(c echo.Context) string { return "all" }),
	)
	readconfig := router.Group(
		"",
		auth.CheckHeaderBasedAuth,
		// echo.WrapMiddleware(auth.AuthenticateCASUser),
		auth.AuthorizeRequest("read-config", "configuration", func(c echo.Context) string { return "all" }),
	)

	router.GET("/health", echo.WrapHandler(http.HandlerFunc(health.Check)))
	router.GET("/status", handlers.Status)
	router.PUT("/log-level/:level", log.SetLogLevel)
	router.GET("/log-level", log.GetLogLevel)
	// router.PUT("/dev/:state", handlers.SetDev)

	router.GET("/auth/admin", handlers.HasAdminRights)

	readconfig.GET("/buildings", handlers.GetBuildings)
	readconfig.GET("/buildings/:building", handlers.GetBuildingByID)
	writeconfig.POST("/buildings/:building", handlers.AddBuilding)
	writeconfig.PUT("/buildings/:building/update", handlers.UpdateBuilding)

	readconfig.GET("/buildings/:building/rooms", handlers.GetRoomsByBuilding)
	readconfig.GET("/rooms", handlers.GetAllRooms)
	readconfig.GET("/rooms/:room", handlers.GetRoomByID)
	writeconfig.POST("/rooms/:room/add", handlers.AddRoom)
	writeconfig.PUT("/rooms/:room/update", handlers.UpdateRoom)

	writeconfig.POST("/devices/:device/add", handlers.AddDevice)
	readconfig.GET("/rooms/:room/devices", handlers.GetDevicesByRoom)
	readconfig.GET("/rooms/:room/roles/:role", handlers.GetDevicesByRoomAndRole)
	readconfig.GET("/roles/:role/types/:type", handlers.GetDevicesByRoleAndType)
	writeconfig.POST("/devices/bulk/add", handlers.AddDevicesInBulk)
	writeconfig.PUT("/devices/:device/update", handlers.UpdateDevice)
	readconfig.GET("/devices/:device/address", handlers.ResolveDNSAddress)

	readconfig.GET("/roomconfigurations", handlers.GetRoomConfigurations)
	readconfig.GET("/roomdesignations", handlers.GetRoomDesignations)
	readconfig.GET("/devicetypes", handlers.GetDeviceTypes)
	readconfig.GET("/deviceroles", handlers.GetDeviceRoles)
	readconfig.GET("/templates", handlers.GetAllTemplates)
	readconfig.GET("/icons", handlers.GetIcons)

	readconfig.GET("/uiconfig/:room", handlers.GetUIConfig)
	writeconfig.POST("/uiconfig/:room/add", handlers.AddUIConfig)
	writeconfig.PUT("/uiconfig/:room/update", handlers.UpdateUIConfig)

	router.GET("/changes", handlers.GetChanges)
	router.GET("/changes/clear", handlers.ClearChanges)
	router.GET("/changes/write", handlers.WriteChanges)

	readconfig.GET("/buildings/:building/rooms/:room", handlers.GetRoomState)
	writeconfig.PUT("/buildings/:building/rooms/:room", handlers.SetRoomState)

	router.GET("/buildings/:building/rooms/:room/subscribe", handlers.SubscribeToRoom)
	router.GET("/buildings/:building/rooms/:room/unsubscribe", handlers.UnsubscribeFromRoom)

	// router.Static("/", "db-tool-dist")
	// router.Static("/home", "db-tool-dist")
	// router.Static("/walkthrough", "db-tool-dist")
	// router.Static("/building", "db-tool-dist")
	// router.Static("/room", "db-tool-dist")
	// router.Static("/device", "db-tool-dist")
	// router.Static("/uiconfig", "db-tool-dist")
	// router.Static("/summary", "db-tool-dist")

	router.Use(auth.CheckHeaderBasedAuth,
		// echo.WrapMiddleware(auth.AuthenticateCASUser),
		auth.AuthorizeRequest("read-config", "configuration", func(c echo.Context) string { return "all" }),
		middleware.StaticWithConfig(middleware.StaticConfig{
			Root:   "db-tool-dist",
			Index:  "index.html",
			HTML5:  true,
			Browse: true,
		}))

	server := http.Server{
		Addr:           port,
		MaxHeaderBytes: 1024 * 10,
	}

	router.StartServer(&server)
}
