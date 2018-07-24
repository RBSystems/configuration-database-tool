package handlers

import (
	"net/http"

	"github.com/byuoitav/common/log"
	"github.com/labstack/echo"
)

// Health returns the health status of the application.
func Health(context echo.Context) error {
	msg := "Things are fine."
	log.L.Debug(msg)
	return context.JSON(http.StatusOK, msg)
}
