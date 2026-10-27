output "container_name" {
  description = "Nom du conteneur NetAlert gere par Terraform"
  value       = docker_container.netalert.name
}

output "application_url" {
  description = "URL locale de NetAlert"
  value       = "http://localhost:3001"
}

output "docker_network_name" {
  description = "Nom du reseau Docker cree par Terraform"
  value       = docker_network.netalert.name
}
