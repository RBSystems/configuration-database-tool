package handlers

import (
	"net/http"

	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"
	"github.com/labstack/echo"
)

// GetAllTemplates returns a list of all templates from the database.
func GetAllTemplates(context echo.Context) error {
	log.L.Debug("[options] Starting GetAllTemplates...")

	// if !Dev {
	// 	ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
	// 	if err != nil {
	// 		log.L.Errorf("[options] Failed to verify read role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
	// 		return context.JSON(http.StatusInternalServerError, err.Error())
	// 	}
	// 	if !ok {
	// 		log.L.Warnf("[options] User %s is not allowed to get all templates.", context.Request().Context().Value("user").(string))
	// 		return context.JSON(http.StatusForbidden, alert)
	// 	}
	// }

	log.L.Debug("[options] Attempting to get all templates")

	templates, err := db.GetDB().GetAllTemplates()
	if err != nil {
		log.L.Errorf("[options] An error occurred while getting all templates : %v", err.Error())
		return context.JSON(http.StatusInternalServerError, err)
	}

	log.L.Debug("[options] Successfully got all templates!")
	return context.JSON(http.StatusOK, templates)
}

// GetIcons returns the list of possible icons from the database.
func GetIcons(context echo.Context) error {
	log.L.Debug("[options] Starting GetIcons...")

	// if !Dev {
	// 	ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
	// 	if err != nil {
	// 		log.L.Errorf("[options] Failed to verify read role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
	// 		return context.JSON(http.StatusInternalServerError, err.Error())
	// 	}
	// 	if !ok {
	// 		log.L.Warnf("[options] User %s is not allowed to get the icon list.", context.Request().Context().Value("user").(string))
	// 		return context.JSON(http.StatusForbidden, alert)
	// 	}
	// }

	log.L.Debug("[options] Attempting to get the icon list")

	icons, err := db.GetDB().GetIcons()
	if err != nil {
		log.L.Errorf("[options] An error occurred while getting the icon list : %v", err.Error())
		return context.JSON(http.StatusInternalServerError, err)
	}

	log.L.Debug("[options] Successfully got the icon list!")
	return context.JSON(http.StatusOK, icons)
}

// GetRoomDesignations returns a list of all the RoomDesignations from the database.
func GetRoomDesignations(context echo.Context) error {
	log.L.Debug("[options] Starting GetRoomDesignations...")

	// if !Dev {
	// 	ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
	// 	if err != nil {
	// 		log.L.Errorf("[options] Failed to verify read role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
	// 		return context.JSON(http.StatusInternalServerError, err.Error())
	// 	}
	// 	if !ok {
	// 		log.L.Warnf("[options] User %s is not allowed to get all room designations.", context.Request().Context().Value("user").(string))
	// 		return context.JSON(http.StatusForbidden, alert)
	// 	}
	// }

	log.L.Debug("[options] Attempting to get all room designations")

	designations, err := db.GetDB().GetRoomDesignations()
	if err != nil {
		log.L.Errorf("[options] Failed to get all room designations : %v", err.Error())
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	log.L.Debug("[options] Successfully got all room designations!")
	return context.JSON(http.StatusOK, designations)
}

// GetDeviceRoles returns a list of all device roles in the database.
func GetDeviceRoles(context echo.Context) error {
	log.L.Debug("[options] Starting GetDeviceRoles...")

	// if !Dev {
	// 	ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
	// 	if err != nil {
	// 		log.L.Errorf("[options] Failed to verify read role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
	// 		return context.JSON(http.StatusInternalServerError, err.Error())
	// 	}
	// 	if !ok {
	// 		log.L.Warnf("[options] User %s is not allowed to get all device roles.", context.Request().Context().Value("user").(string))
	// 		return context.JSON(http.StatusForbidden, alert)
	// 	}
	// }

	log.L.Debug("[options] Attempting to get all device roles")

	deviceRoles, err := db.GetDB().GetDeviceRoles()
	if err != nil {
		log.L.Errorf("[options] An error occurred while getting device roles: %v", err.Error())
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	log.L.Debug("[options] Successfully got all device roles!")
	return context.JSON(http.StatusOK, deviceRoles)
}
