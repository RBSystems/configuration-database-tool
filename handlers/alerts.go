package handlers

import (
	"net/http"

	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/configuration-database-tool/quartermaster"
	"github.com/labstack/echo"
)

func GetAllAlerts(context echo.Context) error {
	log.L.Debug("Getting all alerts for all buildings")

	allStatuses, err := quartermaster.GetStatusAllBuildings(db.GetDB())

	if err != nil {
		log.L.Errorf("Could not Get Status of all Buildings: %v", err)
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	return context.JSON(http.StatusOK, allStatuses)
}

func GetAlertsByBuilding(context echo.Context) error {
	log.L.Debug("Getting alerts by Building")

	buildingID := context.Param("building")
	buildingStatus, err := quartermaster.GetStatusBuilding(db.GetDB(), buildingID)
	if err != nil {
		log.L.Errorf("Could not get status of building %v: %v", buildingID, err)
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	return context.JSON(http.StatusOK, buildingStatus)
}

func GetAlertsForAllRoomsInABuilding(context echo.Context) error {
	log.L.Debug("Getting all the room alerts for building")

	buildingID := context.Param("building")
	roomStatuses, err := quartermaster.GetStatusAllRoomsByBuilding(db.GetDB(), buildingID)
	if err != nil {
		log.L.Errorf("Could not get status of building %v: %v", buildingID, err.Error())
		return context.JSON(http.StatusInternalServerError, err.Error())
	}
	return context.JSON(http.StatusOK, roomStatuses)
}

func GetAlertsByRoom(context echo.Context) error {
	log.L.Debug("Getting all alerts for a room")

	roomID := context.Param("room")
	roomStatus, err := quartermaster.GetStatusRoom(db.GetDB(), roomID)
	if err != nil {
		log.L.Errorf("Could not get status of room %v: %v", roomID, err.Error())
		return context.JSON(http.StatusInternalServerError, err.Error())
	}
	return context.JSON(http.StatusOK, roomStatus)
}
