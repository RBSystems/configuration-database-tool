package main

import (
	"net/http"
	"os"

	"github.com/byuoitav/central-event-system/hub/base"
	"github.com/byuoitav/central-event-system/messenger"
	"github.com/byuoitav/common/v2/auth"
	"github.com/byuoitav/common/log"
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

	handlers.Dev = false

	// Use the `secure` routing group to require authentication
	// secure := router.Group("", echo.WrapMiddleware(authmiddleware.Authenticate))

	// if !handlers.Dev {
	secure := router.Group("", echo.WrapMiddleware(auth.AuthenticateCASUser))
	// }

	router.GET("/health", echo.WrapHandler(http.HandlerFunc(health.Check)))
	router.GET("/status", handlers.Status)
	router.PUT("/log-level/:level", log.SetLogLevel)
	router.GET("/log-level", log.GetLogLevel)
	// router.PUT("/dev/:state", handlers.SetDev)

	router.GET("/auth/admin", handlers.HasAdminRights)

	secure.GET("/buildings", handlers.GetBuildings)
	secure.GET("/buildings/:building", handlers.GetBuildingByID)
	secure.POST("/buildings/:building", handlers.AddBuilding)
	secure.PUT("/buildings/:building/update", handlers.UpdateBuilding)

	secure.GET("/buildings/:building/rooms", handlers.GetRoomsByBuilding)
	secure.GET("/rooms", handlers.GetAllRooms)
	secure.GET("/rooms/:room", handlers.GetRoomByID)
	secure.POST("/rooms/:room/add", handlers.AddRoom)
	secure.PUT("/rooms/:room/update", handlers.UpdateRoom)

	secure.POST("/devices/:device/add", handlers.AddDevice)
	secure.GET("/rooms/:room/devices", handlers.GetDevicesByRoom)
	secure.GET("/rooms/:room/roles/:role", handlers.GetDevicesByRoomAndRole)
	secure.GET("/roles/:role/types/:type", handlers.GetDevicesByRoleAndType)
	secure.POST("/devices/bulk/add", handlers.AddDevicesInBulk)
	secure.PUT("/devices/:device/update", handlers.UpdateDevice)
	secure.GET("/devices/:device/address", handlers.ResolveDNSAddress)

	secure.GET("/roomconfigurations", handlers.GetRoomConfigurations)
	secure.GET("/roomdesignations", handlers.GetRoomDesignations)
	secure.GET("/devicetypes", handlers.GetDeviceTypes)
	secure.GET("/deviceroles", handlers.GetDeviceRoles)
	secure.GET("/templates", handlers.GetAllTemplates)
	secure.GET("/icons", handlers.GetIcons)

	secure.GET("/uiconfig/:room", handlers.GetUIConfig)
	secure.POST("/uiconfig/:room/add", handlers.AddUIConfig)
	secure.PUT("/uiconfig/:room/update", handlers.UpdateUIConfig)

	router.GET("/changes", handlers.GetChanges)
	router.GET("/changes/clear", handlers.ClearChanges)
	router.GET("/changes/write", handlers.WriteChanges)

	secure.GET("/buildings/:building/rooms/:room", handlers.GetRoomState)
	secure.PUT("/buildings/:building/rooms/:room", handlers.SetRoomState)

	router.GET("/buildings/:building/rooms/:room/subscribe", handlers.SubscribeToRoom)
	router.GET("/buildings/:building/rooms/:room/unsubscribe", handlers.UnsubscribeFromRoom)

	secure.Static("/", "db-tool-dist")
	secure.Static("/home", "db-tool-dist")
	secure.Static("/walkthrough", "db-tool-dist")
	secure.Static("/building", "db-tool-dist")
	secure.Static("/room", "db-tool-dist")
	secure.Static("/device", "db-tool-dist")
	secure.Static("/uiconfig", "db-tool-dist")
	secure.Static("/summary", "db-tool-dist")

	server := http.Server{
		Addr:           port,
		MaxHeaderBytes: 1024 * 10,
	}

	router.StartServer(&server)
}
