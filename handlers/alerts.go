package handlers

import (
	"fmt"
	"net/http"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/configuration-database-tool/helpers"
	"github.com/labstack/echo"
)

// GetAllAlerts gets all alerts from the database
func GetAllAlerts(context echo.Context) error {
	log.L.Debugf("%s Starting GetAllAlerts...", helpers.AlertsTag)

	campusStatusMap, err := helpers.GetAlertsForAllBuildings()
	if err != nil {
		msg := fmt.Sprintf("failed to get all alerts : %s", err.Error())
		log.L.Errorf("%s %s", helpers.AlertsTag, msg)
		return context.JSON(http.StatusInternalServerError, err)
	}

	log.L.Debugf("%s Successfully got all alerts!", helpers.AlertsTag)
	return context.JSON(http.StatusOK, campusStatusMap)
}

// GetAlertsByRoom gets all alerts for a room from the database based on the given room ID
func GetAlertsByRoom(context echo.Context) error {
	log.L.Debugf("%s Starting GetAlertsByRoom...", helpers.AlertsTag)

	roomID := context.Param("room")

	roomAlerts, err := helpers.GetStatusOfRoom(roomID)
	if err != nil {
		msg := fmt.Sprintf("failed to get the alerts for the room %s : %s", roomID, err.Error())
		log.L.Errorf("%s %s", helpers.AlertsTag, msg)
		return context.JSON(http.StatusInternalServerError, err)
	}

	log.L.Debugf("%s Successfully got alerts for the room %s!", helpers.AlertsTag, roomID)
	return context.JSON(http.StatusOK, roomAlerts)
}

// GetAlertsByBuilding gets a list of all alerts for a building from the database based on the given room ID
func GetAlertsByBuilding(context echo.Context) error {
	log.L.Debugf("%s Starting GetAlertsByBuilding...", helpers.AlertsTag)

	buildingID := context.Param("building")

	buildingAlerts, err := helpers.GetStatusOfBuilding(buildingID, false)
	if err != nil {
		msg := fmt.Sprintf("failed to get the alerts for the building %s : %s", buildingID, err.Error())
		log.L.Errorf("%s %s", helpers.AlertsTag, msg)
		return context.JSON(http.StatusInternalServerError, err)
	}

	log.L.Debugf("%s Successfully got alerts for the building %s!", helpers.AlertsTag, buildingID)
	return context.JSON(http.StatusOK, buildingAlerts)
}
