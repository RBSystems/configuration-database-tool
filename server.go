package main

import (
	"net/http"

	"github.com/byuoitav/common"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/v2/auth"
	"github.com/byuoitav/configuration-database-tool/handlers"
	"github.com/jessemillar/health"
	"github.com/labstack/echo"
)

func main() {
	port := ":9999"
	router := common.NewRouter()

	write := router.Group("", auth.AuthorizeRequest("write-state", "room", auth.LookupResourceFromAddress))
	read := router.Group("", auth.AuthorizeRequest("read-state", "room", auth.LookupResourceFromAddress))

	// Health Endpoints
	router.GET("/health", echo.WrapHandler(http.HandlerFunc(health.Check)))
	router.GET("/status", handlers.Status)

	// Building Endpoints
	write.POST("/buildings/:building", handlers.AddBuilding)
	write.POST("/buildings/", handlers.AddBuildings)
	read.GET("/buildings/:building", handlers.GetBuilding)
	read.GET("/buildings", handlers.GetBuildings)
	write.PUT("/buildings/:building/update", handlers.UpdateBuilding)
	write.PUT("/buildings/update", handlers.UpdateBuildings)
	write.GET("/buildings/:building/delete", handlers.DeleteBuilding)
	write.GET("/buildings/delete", handlers.DeleteBuildings)

	// Room Endpoints
	write.POST("/rooms/:room", handlers.AddRoom)
	write.POST("/rooms", handlers.AddRooms)
	read.GET("/rooms/:room", handlers.GetRoom)
	read.GET("/rooms", handlers.GetRooms)
	read.GET("/rooms/:building", handlers.GetRoomsByBuilding)
	write.PUT("/rooms/:room/update", handlers.UpdateRoom)
	write.PUT("/rooms/update", handlers.UpdateRooms)
	write.GET("/rooms/:room/delete", handlers.DeleteRoom)
	write.GET("/rooms/delete", handlers.DeleteRooms)
	read.GET("/rooms/configurations", handlers.GetRoomConfigurations)
	read.GET("/rooms/designations", handlers.GetRoomDesignations)

	// Device Endpoints
	write.POST("/devices/:device", handlers.AddDevice)
	write.POST("/devices", handlers.AddDevices)
	read.GET("/devices/:device", handlers.GetDevice)
	read.GET("/devices", handlers.GetDevices)
	write.PUT("/devices/:device/update", handlers.UpdateDevice)
	write.PUT("/devices/update", handlers.UpdateDevices)
	write.GET("/devices/:device/delete", handlers.DeleteDevice)
	write.GET("/devices/delete", handlers.DeleteDevices)
	read.GET("/devices/:room", handlers.GetDevicesByRoom)
	read.GET("/devices/:room/roles/:role", handlers.GetDevicesByRoomAndRole)
	read.GET("/devices/roles/:role/types/:type", handlers.GetDevicesByRoleAndType)
	read.GET("/devices/types", handlers.GetDeviceTypes)

	// UI Config Endpoints
	write.POST("/uiconfigs/:room", handlers.AddUIConfig)
	write.POST("/uiconfigs", handlers.AddUIConfigs)
	read.GET("/uiconfigs/:room", handlers.GetUIConfig)
	read.GET("/uiconfigs", handlers.GetUIConfigs)
	write.PUT("/uiconfigs/:room/update", handlers.UpdateUIConfig)
	write.PUT("/uiconfigs/update", handlers.UpdateUIConfigs)
	write.GET("/uiconfigs/:room/delete", handlers.DeleteUIConfig)
	write.GET("/uiconfigs/delete", handlers.DeleteUIConfigs)

	// Options Endpoints
	read.GET("/options/templates", handlers.GetAllTemplates)
	read.GET("/options/icons", handlers.GetIcons)
	read.GET("/options/roles", handlers.GetDeviceRoles)

	// Alert Endpoints
	read.GET("/alerts/buildings/:building", handlers.GetAlertsByBuilding)
	read.GET("/alerts/buildings/:building/rooms", handlers.GetAlertsForAllRoomsInABuilding)
	read.GET("/alerts/rooms/:room", handlers.GetAlertsByRoom)

	// Log Level Endpoints
	router.PUT("/log-level/:level", log.SetLogLevel)
	router.GET("/log-level", log.GetLogLevel)

	// Webpage Endpoints
	router.Static("/", "db-tool-dist")
	router.Static("/home", "db-tool-dist")
	router.Static("/walkthrough", "db-tool-dist")
	router.Static("/building", "db-tool-dist")
	router.Static("/room", "db-tool-dist")
	router.Static("/device", "db-tool-dist")
	router.Static("/uiconfig", "db-tool-dist")
	router.Static("/summary", "db-tool-dist")

	server := http.Server{
		Addr:           port,
		MaxHeaderBytes: 1024 * 10,
	}

	router.StartServer(&server)
}
