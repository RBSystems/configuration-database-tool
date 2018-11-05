package socket

import (
	"fmt"
	"log"
	"net"
	"net/http"
	"strings"

	"github.com/byuoitav/common/status"
	"github.com/fatih/color"
	"github.com/labstack/echo"
)

type Manager struct {
	// registered clients
	clients map[*Client]bool

	// inbound messages from clients
	broadcast chan interface{}

	// 'register' requests from clients
	register chan *Client

	// 'unregister' requests from clients
	unregister chan *Client
}

var M *Manager

func init() {
	M = &Manager{
		broadcast:  make(chan interface{}, 1000),
		register:   make(chan *Client, 100),
		unregister: make(chan *Client, 100),
		clients:    make(map[*Client]bool),
	}
	go M.run()
}

func NewManager() *Manager {
	hub := &Manager{
		broadcast:  make(chan interface{}, 1000),
		register:   make(chan *Client, 100),
		unregister: make(chan *Client, 100),
		clients:    make(map[*Client]bool),
	}
	go hub.run()

	return hub
}

func (h *Manager) WriteToSockets(message interface{}) {
	h.broadcast <- message
}

func (h *Manager) GetStatus(context echo.Context) error {
	ret := status.NewStatus()
	var err error
	statusInfo := make(map[string]interface{})

	ret.Version, err = status.GetMicroserviceVersion()
	if err != nil {
		ret.StatusCode = status.Sick
		ret.Info["err"] = err.Error()
	} else {
		ret.StatusCode = status.Healthy
	}

	statusInfo["websocket-connections"] = len(h.clients)
	var wsInfo []map[string]interface{}

	for client := range h.clients {
		info := make(map[string]interface{})
		localAddr := client.conn.LocalAddr()
		remoteAddr := client.conn.RemoteAddr()
		info["raw-connection"] = fmt.Sprintf("%s => %s", remoteAddr, localAddr)

		resolvedLocal, err := net.LookupAddr(strings.Split(localAddr.String(), ":")[0])
		if err != nil {
			info["resolve-local-error"] = err.Error()
		}

		resolvedRemote, err := net.LookupAddr(strings.Split(remoteAddr.String(), ":")[0])
		if err != nil {
			info["resolve-remote-error"] = err.Error()
		}
		info["resolved-connection"] = fmt.Sprintf("%s => %s", resolvedRemote, resolvedLocal)

		wsInfo = append(wsInfo, info)
	}

	statusInfo["websocket-info"] = wsInfo
	ret.Info = statusInfo

	return context.JSON(http.StatusOK, ret)
}

func (h *Manager) run() {
	for {
		select {
		case client := <-h.register:
			remoteAddr := client.conn.RemoteAddr()

			h.clients[client] = true

			color.Set(color.FgYellow, color.Bold)
			log.Printf("New socket connection: %s", remoteAddr)
			color.Unset()

		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				remoteAddr := client.conn.RemoteAddr()

				delete(h.clients, client)
				close(client.send)

				color.Set(color.FgYellow, color.Bold)
				log.Printf("Removed socket connection: %s", remoteAddr)
				color.Unset()
			}
		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}
