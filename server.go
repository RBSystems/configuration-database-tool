package main

import (
	"net/http"

	"github.com/byuoitav/authmiddleware"
)

func main() {
	port := ":9999"
	router := echo.New()
	router.Pre(middleware.RemoveTrailingSlash())
	router.Use(middleware.CORS())

	// Use the `secure` routing group to require authentication
	secure := router.Group("", echo.WrapMiddleware(authmiddleware.Authenticate))

	router.GET("/health", echo.WrapHandler(http.HandlerFunc(health.Check)))

	secure.GET("/rooms", handlerGroup.GetAllRooms)
	secure.GET("/rooms/buildings/:building", handlerGroup.GetRoomsByBuilding)

	server := http.Server{
		Addr:           port,
		MaxHeaderBytes: 1024 * 10,
	}

	router.StartServer(&server)
}
