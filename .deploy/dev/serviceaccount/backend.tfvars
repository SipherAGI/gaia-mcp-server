eks_cluster_oidc_issuer_url = "https://oidc.eks.ap-southeast-1.amazonaws.com/id/08D39D06858EEDD66DA619EC200E2FC6"
cluster_name                = "g1"
service_account_name        = "mcp-server"
service_account_namespace   = "artventure"
role_anywhere               = true
aws_iam_policy_document = {
    "Statement": [
        {
            "Action": [
                "ssm:GetParameters",
                "ssm:GetParameter"
            ],
            "Effect": "Allow",
            "Resource": [
                "arn:aws:ssm:ap-southeast-1:127395585441:parameter/gaia-mcp/dev/*",
                "arn:aws:ssm:ap-southeast-1:127395585441:parameter/artventure/dev/*",
                "arn:aws:ssm:ap-southeast-1:127395585441:parameter/ather-os/dev/*"
            ],
            "Sid": "AllowGetParameter"
        }
    ],
    "Version": "2012-10-17"
}