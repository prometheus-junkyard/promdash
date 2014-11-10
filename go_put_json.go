package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"log"
	"net/http"
	"os"
)

func main() {
	var (
		fn  = flag.String("f", "", "file name")
		e   = flag.String("e", "", "PUT endpoint")
		err error
	)
	flag.Parse()

	if *e == "" || *fn == "" {
		flag.Usage()
		os.Exit(1)
	}

	f, err := os.Open(*fn)
	if err != nil {
		log.Fatalf("Error: %s", err.Error())
	}
	defer f.Close()

	c := http.DefaultClient

	// Why does this fail if I pass in the file directly?
	var fileJSON map[string]interface{}
	json.NewDecoder(f).Decode(&fileJSON)
	byts, err := json.Marshal(fileJSON)
	if err != nil {
		log.Fatalf("Error: %s", err.Error())
	}

	req, err := http.NewRequest("PUT", *e, bytes.NewBuffer(byts))
	if err != nil {
		log.Fatalf("Error: %s", err.Error())
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.Do(req)
	if err != nil {
		log.Fatalf("Error: %s", err.Error())
	}
	defer resp.Body.Close()

	if resp.StatusCode != 204 {
		log.Fatalf("Error: Response code %d", resp.StatusCode)
	}
}
