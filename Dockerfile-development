FROM golang:alpine

RUN apk update && apk add git

RUN mkdir -p /go/src/github.com/byuoitav
ADD . /go/src/github.com/byuoitav/configuration-database-tool

WORKDIR /go/src/github.com/byuoitav/configuration-database-tool
RUN go get -d -v
RUN go install -v

CMD ["/go/bin/configuration-database-tool"]

EXPOSE 9999
