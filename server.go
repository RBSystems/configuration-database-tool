package main

import (
	"net/http"

	"github.com/byuoitav/authmiddleware"
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

	server := http.Server{
		Addr:           port,
		MaxHeaderBytes: 1024 * 10,
	}

	router.StartServer(&server)
}
