package handlers

import (
	"net/http"

	"github.com/byuoitav/common/auth"
	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"github.com/labstack/echo"
)

// GetAllTemplates returns a list of all templates from the database.
func GetAllTemplates(context echo.Context) error {
	log.L.Debug("Attempting to get all templates")

	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
		if err != nil {
			log.L.Errorf("User had an error : %v", err.Error())
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			log.L.Errorf("User no good : %v", err.Error())
			return context.JSON(http.StatusForbidden, alert)
		}

		log.L.Debug("User seems ok")
	}

	templates, err := db.GetDB().GetAllTemplates()
	if err != nil {
		nerr.Translate(err).Add("error calling for dbo to return all templates")
		return context.JSON(http.StatusInternalServerError, err)
	}

	log.L.Debug("Successfully got all templates")
	return context.JSON(http.StatusOK, templates)
}

// GetIcons returns the list of possible icons from the database.
func GetIcons(context echo.Context) error {
	log.L.Debug("Attempting to get all icons")

	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
		if err != nil {
			log.L.Errorf("User had an error : %v", err.Error())
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			log.L.Errorf("User no good : %v", err.Error())
			return context.JSON(http.StatusForbidden, alert)
		}

		log.L.Debug("User seems ok")
	}

	icons, err := db.GetDB().GetIcons()
	if err != nil {
		log.L.Error("error calling for dbo to return icon list : %s", err.Error())
		return context.JSON(http.StatusInternalServerError, err)
	}

	log.L.Debug("Successfully got all icons")
	return context.JSON(http.StatusOK, icons)
}
