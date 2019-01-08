package handlers

import (
	"fmt"
	"net/http"

	"github.com/byuoitav/central-event-system/messenger"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/configuration-database-tool/socket"
	"github.com/labstack/echo"
)

// Message is a message down a websocket
type Message struct {
	Message string `json:"message"`
}

var msgr *messenger.Messenger

// SetMessenger takes a Messenger and assigns it to this package variable.
func SetMessenger(m *messenger.Messenger) {
	msgr = m
}

// SubscribeToRoom subscribes this messenger to a certain room's events.
func SubscribeToRoom(context echo.Context) error {
	buildingID := context.Param("building")
	room := context.Param("room")

	roomID := fmt.Sprintf("%s-%s", buildingID, room)

	msgr.SubscribeToRooms(roomID)

	log.L.Infof("Subscribed to %s events", roomID)

	return context.JSON(http.StatusOK, fmt.Sprintf("Subscribed to %s events", roomID))
}

// UnsubscribeFromRoom unsubscribes this messenger from receiving events for a certain room.
func UnsubscribeFromRoom(context echo.Context) error {
	building := context.Param("building")
	room := context.Param("room")

	roomID := fmt.Sprintf("%s-%s", building, room)

	msgr.UnsubscribeFromRooms(roomID)

	log.L.Infof("Unsubscribed from %s events", roomID)

	return context.JSON(http.StatusOK, fmt.Sprintf("Unsubscribed from %s events", roomID))
}

// WriteEventsToSocket writes events along a websocket connection.
func WriteEventsToSocket() {
	for {
		event := msgr.ReceiveEvent()

		socket.M.WriteToSockets(event)
	}
}
