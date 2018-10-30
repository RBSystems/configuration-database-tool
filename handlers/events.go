package handlers

import (
	"fmt"
	"net/http"

	"github.com/byuoitav/central-event-system/messenger"
	"github.com/labstack/echo"
)

var msgr *messenger.Messenger

// SubscribeToRoom subscribes this messenger to a certain room's events.
func SubscribeToRoom(context echo.Context) error {
	buildingID := context.Param("building")
	room := context.Param("room")

	roomID := fmt.Sprintf("%s-%s", buildingID, room)

	rooms := []string{roomID}

	msgr.SubscribeToRooms(rooms)

	return context.JSON(http.StatusOK, fmt.Sprintf("Subscribed to %s events", roomID))
}
