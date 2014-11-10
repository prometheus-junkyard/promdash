package main

import (
	"encoding/json"
	"flag"
	"log"
	"net/http"
	"net/url"
	"os"
)

func main() {
	var (
		e = flag.String("e", "", "endpoint")
	)
	flag.Parse()

	if *e == "" {
		flag.Usage()
		os.Exit(1)
	}

	resp, err := http.Get(*e)
	if err != nil {
		log.Fatalf("Error: %s", err.Error())
	}
	defer resp.Body.Close()

	var dash map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&dash)
	pp, err := json.MarshalIndent(dash, "", "    ")
	if err != nil {
		log.Fatalf("Error: %s", err.Error())
	}

	url, err := url.Parse(*e)
	if err != nil {
		log.Fatalf("Error: %s", err.Error())
	}

	f, err := os.Create(url.Path[1:])
	if err != nil {
		log.Fatalf("Error: %s", err.Error())
	}
	defer f.Close()
	f.Write(pp)
}
