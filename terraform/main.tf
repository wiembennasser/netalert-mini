terraform {
  required_version = ">= 1.5.0"

  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

resource "docker_network" "netalert" {
  name = "netalert-terraform-network"
}

resource "docker_image" "netalert" {
  name         = "netalert-mini-netalert:latest"
  keep_locally = true
}

resource "docker_container" "netalert" {
  name  = "netalert-terraform"
  image = docker_image.netalert.image_id

  ports {
    internal = 3000
    external = 3001
  }

  networks_advanced {
    name = docker_network.netalert.name
  }

  restart = "unless-stopped"
}
