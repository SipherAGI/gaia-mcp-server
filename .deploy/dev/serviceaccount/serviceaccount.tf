terraform {
  backend "s3" {}
}

module "service_account_role" {
  source                      = "git::ssh://git@github.com/sipherxyz/DevOps.git?ref=service-account-role-module"
  eks_cluster_oidc_issuer_url = var.eks_cluster_oidc_issuer_url
  cluster_name                = var.cluster_name
  service_account_name        = var.service_account_name
  service_account_namespace   = var.service_account_namespace
  aws_iam_policy_document     = [jsonencode(var.aws_iam_policy_document)]
  role_anywhere               = var.role_anywhere
}

variable "eks_cluster_oidc_issuer_url" {
  type    = string
  default = null
}

variable "cluster_name" {
  type    = string
  default = null
}

variable "service_account_name" {
  type    = string
  default = null
}

variable "service_account_namespace" {
  type    = string
  default = null
}

variable "aws_iam_policy_document" {
  type    = any
  default = null
}

variable "github_token" {
  type    = string
  default = null
}

variable "role_anywhere" {
  type    = bool
  default = false
} 