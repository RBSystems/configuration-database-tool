package handlers

import (
	"net/http"

	"github.com/labstack/echo"
)

// GetAllAlerts gets all alerts from the database
func GetAllAlerts(context echo.Context) error {
	return context.JSON(http.StatusOK, nil)
}

// GetAlertsByRoom gets all alerts for a room from the database based on the given room ID
func GetAlertsByRoom(context echo.Context) error {
	return context.JSON(http.StatusOK, nil)
}

// GetAlertsByBuilding gets a list of all alerts for a building from the database based on the given room ID
func GetAlertsByBuilding(context echo.Context) error {
	return context.JSON(http.StatusOK, nil)
}

// GetAlertsPerRoomByBuilding returns a collection of alerts for the entire building, but they are grouped together by which room they are in
func GetAlertsPerRoomByBuilding(context echo.Context) error {
	return context.JSON(http.StatusOK, nil)
}
