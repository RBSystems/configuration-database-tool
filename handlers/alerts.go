package handlers

import (
	"net/http"

	"github.com/byuoitav/common/auth"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/configuration-database-tool/quartermaster"
	"github.com/labstack/echo"
)

func GetAllAlerts(context echo.Context) error {
	log.L.Debug("Getting all alerts for all buildings")

	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
		if err != nil {
			log.L.Errorf("[device] Failed to verify read role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			log.L.Warnf("[device] User %s is not allowed to get all devices in a room.", context.Request().Context().Value("user").(string))
			return context.JSON(http.StatusForbidden, alert)
		}
	}

	allStatuses, err := quartermaster.GetStatusAllBuildings()

	if err != nil {
		log.L.Errorf("Could not Get Status of all Buildings: %v", err)
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	return context.JSON(http.StatusOK, allStatuses)
}

func GetAlertsByBuilding(context echo.Context) error {
	log.L.Debug("Getting alerts by Building")

	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
		if err != nil {
			log.L.Errorf("[device] Failed to verify read role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			log.L.Warnf("[device] User %s is not allowed to get all devices in a room.", context.Request().Context().Value("user").(string))
			return context.JSON(http.StatusForbidden, alert)
		}
	}

	buildingID := context.Param("building")
	buildingStatus, err := quartermaster.GetStatusBuilding(buildingID)
	if err != nil {
		log.L.Errorf("Could not get status of building %v: %v", buildingID, err)
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	return context.JSON(http.StatusOK, buildingStatus)
}

func GetAlertsByAllRooms(context echo.Context) error {
	log.L.Debug("Getting all the room alerts for building")

	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
		if err != nil {
			log.L.Errorf("[device] Failed to verify read role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			log.L.Warnf("[device] User %s is not allowed to get all devices in a room.", context.Request().Context().Value("user").(string))
			return context.JSON(http.StatusForbidden, alert)
		}
	}

	buildingID := context.Param("building")
	roomStatuses, err := quartermaster.GetStatusAllRoomsByBuilding(buildingID)
	if err != nil {
		log.L.Errorf("Could not get status of building %v: %v", buildingID, err.Error())
		return context.JSON(http.StatusInternalServerError, err.Error())
	}
	return context.JSON(http.StatusOK, roomStatuses)
}

func GetAlertsByRoom(context echo.Context) error {
	log.L.Debug("Getting all alerts for a room")
	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
		if err != nil {
			log.L.Errorf("[device] Failed to verify read role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			log.L.Warnf("[device] User %s is not allowed to get all devices in a room.", context.Request().Context().Value("user").(string))
			return context.JSON(http.StatusForbidden, alert)
		}
	}

	roomID := context.Param("room")
	roomStatus, err := quartermaster.GetStatusRoom(roomID)
	if err != nil {
		log.L.Errorf("Could not get status of room %v: %v", roomID, err.Error())
		return context.JSON(http.StatusInternalServerError, err.Error())
	}
	return context.JSON(http.StatusOK, roomStatus)
}
