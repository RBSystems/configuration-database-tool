package handlers

import (
	"net/http"

	"github.com/labstack/echo"
)

// Health returns the health status of the application.
func Health(context echo.Context) error {
	msg := "Things are fine."
	return context.JSON(http.StatusOK, msg)
}
