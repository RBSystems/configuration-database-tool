package main

import (
	"net/http"
	"time"

	"github.com/byuoitav/authmiddleware"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/configuration-database-tool/handlers"
	"github.com/jessemillar/health"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

func main() {
	port := ":9999"
	router := echo.New()
	router.Pre(middleware.RemoveTrailingSlash())
	router.Use(middleware.CORS())

	// Use the `secure` routing group to require authentication
	// secure := router.Group("", echo.WrapMiddleware(auth.AuthenticateCASUser))
	secure := router.Group("", echo.WrapMiddleware(authmiddleware.Authenticate))

	router.GET("/health", echo.WrapHandler(http.HandlerFunc(health.Check)))
	router.GET("/status", handlers.Status)
	secure.GET("/buildings", handlers.GetBuildings)
	secure.GET("/buildings/:building/rooms", handlers.GetRoomsByBuilding)
	secure.GET("/buildings/:building", handlers.GetBuildingByID)
	secure.GET("/rooms", handlers.GetAllRooms)
	secure.GET("/rooms/:room", handlers.GetRoomByID)
	secure.GET("/rooms/:room/devices", handlers.GetDevicesByRoom)
	secure.GET("/roomconfigurations", handlers.GetRoomConfigurations)
	secure.GET("/roomdesignations", handlers.GetRoomDesignations)
	secure.GET("/devicetypes", handlers.GetDeviceTypes)
	secure.GET("/deviceroles", handlers.GetDeviceRoles)
	secure.GET("/templates", handlers.GetAllTemplates)
	secure.GET("/icons", handlers.GetIcons)
	secure.GET("/uiconfig/:room", handlers.GetUIConfig)

	secure.POST("/buildings/:building", handlers.AddBuilding)
	secure.POST("/rooms/:room/add", handlers.AddRoom)
	secure.POST("/devices/:device/add", handlers.AddDevice)
	secure.POST("/devices/bulk/add", handlers.AddDevicesInBulk)

	secure.PUT("/buildings/:building/update", handlers.UpdateBuilding)
	secure.PUT("/rooms/:room/update", handlers.UpdateRoom)
	secure.PUT("/devices/:device/update", handlers.UpdateDevice)

	secure.PUT("/log-level/:level", log.SetLogLevel)
	secure.GET("/log-level", log.GetLogLevel)

	secure.Static("/", "db-tool/dist")
	secure.Static("/home", "db-tool/dist")
	secure.Static("/walkthrough", "db-tool/dist")
	secure.Static("/building", "db-tool/dist")
	secure.Static("/room", "db-tool/dist")
	secure.Static("/device", "db-tool/dist")
	secure.Static("/uiconfig", "db-tool/dist")

	server := http.Server{
		Addr:           port,
		MaxHeaderBytes: 1024 * 10,
	}

	handlers.Start = time.Now()
	router.StartServer(&server)
}
