package handlers

import (
	"net/http"

	"github.com/byuoitav/common/auth"
	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/structs"
	"github.com/labstack/echo"
)

// GetUIConfig returns a room's UI config.
func GetUIConfig(context echo.Context) error {
	log.L.Debug("[uiconfig] Starting GetUIConfig...")

	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
		if err != nil {
			log.L.Errorf("[uiconfig] Failed to verify read role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			log.L.Warnf("[uiconfig] User %s is not allowed to get a UI Config.", context.Request().Context().Value("user").(string))
			return context.JSON(http.StatusForbidden, alert)
		}
	}

	var config structs.UIConfig

	roomID := context.Param("room")

	log.L.Debugf("[uiconfig] Attempting to get the UI Config for %s", roomID)

	config, err := db.GetDB().GetUIConfig(roomID)
	if err != nil {
		log.L.Errorf("[uiconfig] Problem getting UI Config for %s : %v", roomID, err.Error())
		return context.JSON(http.StatusBadRequest, err)
	}

	log.L.Debugf("[uiconfig] Successfully got the UI Config for %s!", roomID)
	return context.JSON(http.StatusOK, config)
}

// AddUIConfig adds a UI Config file to the database.
func AddUIConfig(context echo.Context) error {
	log.L.Debug("[uiconfig] Starting AddUIConfig...")

	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "write")
		if err != nil {
			log.L.Errorf("[uiconfig] Failed to verify write role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			log.L.Warnf("[uiconfig] User %s is not allowed to add a UI Config.", context.Request().Context().Value("user").(string))
			return context.JSON(http.StatusForbidden, alert)
		}
	}

	var config structs.UIConfig

	roomID := context.Param("room")

	log.L.Debugf("[uiconfig] Attempting to add the UI Config for %s", roomID)

	context.Bind(&config)

	changes.AddNew(context.Request().Context().Value("user").(string), UIConfig, roomID)

	config, err := db.GetDB().CreateUIConfig(roomID, config)
	if err != nil {
		log.L.Errorf("[uiconfig] Problem adding UI Config for %s : %v", roomID, err.Error())
		return context.JSON(http.StatusBadRequest, err)
	}

	log.L.Debugf("[uiconfig] Successfully added the UI Config for %s!", roomID)
	return context.JSON(http.StatusOK, config)
}

// UpdateUIConfig updates a UI Config file in the database.
func UpdateUIConfig(context echo.Context) error {
	log.L.Debug("[uiconfig] Starting UpdateUIConfig...")

	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "write")
		if err != nil {
			log.L.Errorf("[uiconfig] Failed to verify write role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			log.L.Warnf("[uiconfig] User %s is not allowed to update a UI Config.", context.Request().Context().Value("user").(string))
			return context.JSON(http.StatusForbidden, alert)
		}
	}

	var config structs.UIConfig

	roomID := context.Param("room")

	log.L.Debugf("[uiconfig] Attempting to update the UI Config for %s", roomID)

	context.Bind(&config)

	oldConfig, err := db.GetDB().GetUIConfig(roomID)
	if err != nil {
		log.L.Errorf("[uiconfig] UIConfig for %s does not exist in the database: %v", roomID, err.Error())
		return context.JSON(http.StatusBadRequest, err.Error())
	}
	changes.AddChange(context.Request().Context().Value("user").(string), UIConfig, FindChanges(oldConfig, config, UIConfig))

	config, err = db.GetDB().UpdateUIConfig(roomID, config)
	if err != nil {
		log.L.Errorf("[uiconfig] Problem updating UI Config for %s : %v", roomID, err.Error())
		return context.JSON(http.StatusBadRequest, err)
	}

	log.L.Debugf("[uiconfig] Successfully updated the UI Config for %s!", roomID)
	return context.JSON(http.StatusOK, config)
}
