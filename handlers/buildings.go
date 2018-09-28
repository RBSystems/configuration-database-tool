package handlers

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/byuoitav/common/auth"
	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/structs"
	"github.com/labstack/echo"
)

var alert = "This action is not allowed."

// GetBuildings returns a list of all the buildings in the database.
func GetBuildings(context echo.Context) error {
	log.L.Debug("[bldg] Starting GetBuildings...")

	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
		if err != nil {
			log.L.Errorf("[bldg] Failed to verify read role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			log.L.Warnf("[bldg] User %s is not allowed to get all buildings.", context.Request().Context().Value("user").(string))
			return context.JSON(http.StatusForbidden, alert)
		}
	}

	log.L.Debug("[bldg] Attempting to get all buildings")

	buildings, err := db.GetDB().GetAllBuildings()
	if err != nil {
		log.L.Errorf("[bldg] Failed to get all buildings : %v", err.Error())
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	log.L.Debug("[bldg] Successfully got all buildings!")
	return context.JSON(http.StatusOK, buildings)
}

// AddBuilding adds a new building to the database.
func AddBuilding(context echo.Context) error {
	log.L.Debug("[bldg] Starting AddBuilding...")

	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "write")
		if err != nil {
			log.L.Errorf("[bldg] Failed to verify write role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			log.L.Warnf("[bldg] User %s is not allowed to add a building.", context.Request().Context().Value("user").(string))
			return context.JSON(http.StatusForbidden, alert)
		}
	}

	id := context.Param("building")

	log.L.Debugf("[bldg] Attempting to add the building %s", id)

	var building structs.Building
	context.Bind(&building)
	if building.ID != id && len(building.ID) > 0 {
		log.L.Error("[bldg] Invalid body. Param ID: %s - Body ID: %s", id, building.ID)
		return context.JSON(http.StatusBadRequest, "Invalid body. Resource address and id must match")
	}

	changes.AddNew(context.Request().Context().Value("user").(string), Building, building.ID)

	building, err := db.GetDB().CreateBuilding(building)
	if err != nil {
		log.L.Errorf("[bldg] Failed to add the building %s : %v", id, err.Error())

		if strings.Contains(err.Error(), "already exists") {
			return context.JSON(http.StatusConflict, fmt.Sprintf("Failed to add the building %s because it already exists.", id))
		}

		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	// Increment the counter on the ServerStatus
	SS.BuildingsCreated++

	log.L.Debugf("[bldg] Successfully added the building %s!", building.ID)
	return context.JSON(http.StatusOK, building)
}

// GetBuildingByID returns a specific building based on the given ID.
func GetBuildingByID(context echo.Context) error {
	log.L.Debug("[bldg] Starting GetBuildingByID...")

	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
		if err != nil {
			log.L.Errorf("[bldg] Failed to verify read role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			log.L.Warnf("[bldg] User %s is not allowed to get a building by ID.", context.Request().Context().Value("user").(string))
			return context.JSON(http.StatusForbidden, alert)
		}
	}

	id := context.Param("building")

	log.L.Debugf("[bldg] Attempting to get the building %s", id)

	building, err := db.GetDB().GetBuilding(id)
	if err != nil {
		log.L.Errorf("[bldg] Failed to get the building %s : %v", id, err.Error())
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	log.L.Debugf("[bldg] Successfully got the building %s!", building.ID)
	return context.JSON(http.StatusOK, building)
}

// UpdateBuilding updates a building in the database.
func UpdateBuilding(context echo.Context) error {
	log.L.Debug("[bldg] Starting UpdateBuilding...")

	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "write")
		if err != nil {
			log.L.Errorf("[bldg] Failed to verify write role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			log.L.Warnf("[bldg] User %s is not allowed to update a building.", context.Request().Context().Value("user").(string))
			return context.JSON(http.StatusForbidden, alert)
		}
	}

	id := context.Param("building")

	log.L.Debugf("[bldg] Attempting to update the building %s", id)

	var building structs.Building
	context.Bind(&building)
	if len(building.ID) == 0 {
		log.L.Error("[bldg] Invalid body. Param ID: %s - Body ID: %s", id, building.ID)
		return context.JSON(http.StatusBadRequest, "Invalid body. Resource address and id must match")
	}

	oldBuilding, err := db.GetDB().GetBuilding(building.ID)
	if err != nil {
		log.L.Errorf("[bldg] Building %s does not exist in the database: %v", id, err.Error())
		return context.JSON(http.StatusBadRequest, err.Error())
	}
	changes.AddChange(context.Request().Context().Value("user").(string), Building, FindChanges(oldBuilding, building, Building))

	building, err = db.GetDB().UpdateBuilding(id, building)
	if err != nil {
		log.L.Errorf("[bldg] Failed to update the building %s : %v", id, err.Error())
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	// Increment the counter on the ServerStatus
	SS.BuildingsUpdated++

	log.L.Debugf("[bldg] Successfully updated the building %s!", building.ID)
	return context.JSON(http.StatusOK, building)
}
