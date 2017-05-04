package main

import (
	"net/http"

	"github.com/byuoitav/authmiddleware"
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
	secure := router.Group("", echo.WrapMiddleware(authmiddleware.Authenticate))

	router.GET("/health", echo.WrapHandler(http.HandlerFunc(health.Check)))
	secure.GET("/buildings", handlers.GetBuildings)
	secure.GET("/buildings/:building/rooms", handlers.GetRoomsByBuilding)
	secure.GET("/buildings/:building", handlers.GetBuildingByShortname)
	secure.GET("/buildings/:building/rooms/:room", handlers.GetRoomByBuildingAndName)
	secure.GET("/buildings/:building/rooms/:room/devices", handlers.GetDevicesByRoom)
	secure.GET("/configuration", handlers.GetConfiguration)
	secure.GET("/roomconfigurations", handlers.GetRoomConfigurations)

	secure.POST("/buildings/:building", handlers.AddBuilding)
	secure.POST("/buildings/:building/rooms/:room", handlers.AddRoom)
	secure.POST("buildings/:building/rooms/:room/devices/:device", handlers.AddDevice)

	secure.POST("/devices/ports/:port", handlers.AddPort)
	secure.POST("/devices/types/:devicetype", handlers.AddDeviceType)
	secure.POST("/devices/endpoints/:endpoint", handlers.AddEndpoint)
	secure.POST("/devices/commands/:command", handlers.AddCommand)
	secure.POST("/devices/powerstates/:powerstate", handlers.AddPowerState)
	secure.POST("/devices/microservices/:microservice", handlers.AddMicroservice)
	secure.POST("/devices/roledefinitions/:deviceroledefinition", handlers.AddRoleDefinition)

	secure.Static("/", "/dist")

	server := http.Server{
		Addr:           port,
		MaxHeaderBytes: 1024 * 10,
	}

	router.StartServer(&server)
}
