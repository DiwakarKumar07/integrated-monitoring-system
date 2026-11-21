# NexusPulse - Unified Observability & Monitoring Dashboard

NexusPulse is a full-stack system observability and telemetry dashboard built with Next.js 15, TypeScript, Tailwind CSS, and Motion, coupled with an enterprise-grade monitoring suite (Prometheus, Grafana, Loki, Tempo, Alertmanager, and Exporters) designed for seamless deployment on **AWS**.

---

## 🚀 Architecture Overview

NexusPulse combines a modern Next.js frontend with industry-standard monitoring engines:

```
                                  [ AWS CloudWatch ]
                                          │
                                          ▼
[ User Browser ] ───▶ [ Next.js Dashboard (:3000) ]
       │                      │
       ▼                      ▼
[ Grafana (:3001) ] ◀── [ Prometheus (:9090) ] ◀── [ Node Exporter (:9100) ]
       │                      │                 ◀── [ Blackbox Exporter (:9115) ]
       │                      ▼                 ◀── [ AWS Exporter (:9106) ]
       │               [ Alertmanager (:9093) ]
       ▼
 [ Loki (:3100) ] ◀── [ Promtail (:9080) ]
       │
 [ Tempo (:3200) ] (Distributed Tracing)
```

### 🛠 Tech Stack

- **Frontend Application**:
  - Next.js 15.5.2 (App Router & Turbopack)
  - React 19.1.0 & TypeScript
  - Tailwind CSS v4 & Motion animation library
- **Observability Suite**:
  - **Prometheus** (`:9090`): Time-series metrics collection and alerting rules
  - **Grafana** (`:3001`): Visualization, metric exploration, and dashboards
  - **Loki** (`:3100`): Cloud-native log aggregation
  - **Tempo** (`:3200`): High-throughput distributed tracing
  - **Alertmanager** (`:9093`): Alert routing, grouping, and notification dispatch
  - **Promtail** (`:9080`): Log shipping agent
  - **Node Exporter** (`:9100`): Host-level OS and kernel telemetry
  - **Blackbox Exporter** (`:9115`): External & internal HTTP/TCP endpoint probe checks
  - **AWS CloudWatch Exporter** (`:9106`): AWS service metrics bridge

---

## 📁 Project Structure

```
nexus-pulse-dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout & page metadata
│   │   ├── page.tsx               # Redesigned NexusPulse UI Hub
│   │   ├── globals.css            # Global styling
│   │   └── api/                   # Next.js API route handlers
│   └── components/                # Reusable UI components
├── monitoring-config/
│   ├── prometheus.yml             # Prometheus scrape configs & probes
│   ├── prometheus_rules.yml       # Alerting evaluation rules
│   ├── alertmanager.yml           # Alert notification routing
│   ├── loki.yml                   # Loki storage & retention configuration
│   ├── promtail.yml               # Promtail log shipping targets
│   ├── tempo.yml                  # Tempo distributed tracing config
│   ├── blackbox.yml               # HTTP/TCP health probe modules
│   ├── aws_exporter.yml           # CloudWatch metrics scrape configuration
│   └── grafana_dashboard.json     # Pre-built monitoring dashboard
├── docker-compose.yml             # Monitoring stack compose (Local dev)
├── docker-compose.prod.yml        # Full stack compose with Next.js app (AWS Prod)
├── Dockerfile                     # Multi-stage production build for Next.js
├── Dockerfile.monitoring          # Monitoring bundle image definition
├── supervisord.conf               # Multi-process supervisor
├── .env.example                   # Environment configuration template
└── README.md
```

---

## 💻 Local Development

### 1. Prerequisites
- Node.js 18+ and npm
- Docker Desktop with Docker Compose

### 2. Run Locally
```bash
# Clone and enter directory
git clone <repository-url>
cd monitoring-dasboard

# Install dependencies
npm install

# Start local monitoring background services
docker compose up -d

# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the NexusPulse dashboard.

---

## ☁️ AWS Deployment Guide

This stack is optimized for deployment on **AWS EC2** using Docker Compose, or containerized on **AWS ECS / EKS**.

### Option 1: AWS EC2 Deployment (Recommended)

#### Step 1: Launch EC2 Instance
1. Go to **AWS Management Console → EC2 → Launch Instance**.
2. **Instance Name**: `nexus-pulse-monitoring`
3. **AMI**: Ubuntu 24.04 LTS (or Amazon Linux 2023) 64-bit (x86_64).
4. **Instance Type**: `t3.medium` (2 vCPU, 4 GiB RAM) minimum; `t3.large` (8 GiB RAM) recommended for heavy metric retention.
5. **Storage**: At least 30–50 GB GP3 EBS root volume.
6. **Key Pair**: Select or create an SSH `.pem` key.

#### Step 2: Configure Security Group
Add the following Inbound Rules in your EC2 Security Group:

| Type | Port Range | Source | Purpose |
|------|------------|--------|---------|
| SSH | `22` | Your IP | Secure Server Access |
| HTTP | `80` | `0.0.0.0/0` | Web Traffic (Nginx/ALB) |
| HTTPS | `443` | `0.0.0.0/0` | Encrypted Web Traffic |
| Custom TCP | `3000` | Any or VPN | Next.js Dashboard UI |
| Custom TCP | `3001` | Any or VPN | Grafana Visualization |
| Custom TCP | `9090` | Internal/VPN | Prometheus (Restricted) |
| Custom TCP | `9093` | Internal/VPN | Alertmanager (Restricted) |

> [!TIP]
> For production environments, keep ports `9090`, `3100`, `3200`, and `9093` private, and route public access only through an Application Load Balancer (ALB) or Nginx reverse proxy with SSL.

#### Step 3: Attach IAM Role for AWS CloudWatch (Best Practice)
Instead of hardcoding AWS secret keys in configuration files:
1. Go to **IAM → Roles → Create Role**.
2. Trusted Entity: **AWS service** → **EC2**.
3. Attach policy: **`CloudWatchReadOnlyAccess`**.
4. Attach this role to your EC2 instance (**Actions → Security → Modify IAM Role**).

#### Step 4: Install Docker & Docker Compose on EC2
Connect to your EC2 instance via SSH:
```bash
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
```

Update packages and install Docker:
```bash
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Install Docker Engine & Compose Plugin
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add current user to docker group (run without sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

#### Step 5: Clone & Configure NexusPulse on EC2
```bash
# Clone your repository
git clone <your-repository-url>
cd monitoring-dasboard

# Copy environment template
cp .env.example .env.local

# Edit configuration
nano .env.local
```

Update your `.env.local` values with your EC2 Public IP or domain:
```env
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_API_URL=http://<EC2-PUBLIC-IP>:3000

# AWS Region (if using IAM Role, keys are automatically resolved)
AWS_REGION=us-east-1

# Monitoring Credentials
GRAFANA_ADMIN_PASSWORD=your-secure-password
PROMETHEUS_RETENTION=200h

# Service URLs
NEXT_PUBLIC_GRAFANA_URL=http://<EC2-PUBLIC-IP>:3001
NEXT_PUBLIC_PROMETHEUS_URL=http://<EC2-PUBLIC-IP>:9090
NEXT_PUBLIC_LOKI_URL=http://<EC2-PUBLIC-IP>:3100
NEXT_PUBLIC_TEMPO_URL=http://<EC2-PUBLIC-IP>:3200
NEXT_PUBLIC_ALERTMANAGER_URL=http://<EC2-PUBLIC-IP>:9093
```

#### Step 6: Start Full Production Stack
Launch the complete stack (Next.js App + Prometheus + Grafana + Loki + Tempo + Exporters):
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Verify that all containers are healthy:
```bash
docker compose -f docker-compose.prod.yml ps
```

---

### Step 7: Optional Nginx Reverse Proxy with Domain & SSL (Let's Encrypt)

If you have a domain pointing to your EC2 IP (e.g. `monitor.yourdomain.com`):

1. **Install Nginx & Certbot**:
   ```bash
   sudo apt-get install -y nginx certbot python3-certbot-nginx
   ```

2. **Configure Nginx** (`/etc/nginx/sites-available/nexus-pulse`):
   ```nginx
   server {
       server_name monitor.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Enable configuration & get SSL certificate**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/nexus-pulse /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   sudo certbot --nginx -d monitor.yourdomain.com
   ```

---

### Option 2: AWS ECS (Elastic Container Service) Architecture

For container-native microservices architecture on AWS:
1. **ECR Repository**: Push Docker images (`nexus_pulse_app`, `Dockerfile.monitoring`) to AWS Elastic Container Registry (ECR).
2. **ECS Task Definition**: Define container definitions with resource limits (CPU/Memory) and environment variables from AWS Secrets Manager or Parameter Store.
3. **Application Load Balancer (ALB)**: Route `/` to the Next.js target group and `/grafana` to the Grafana target group with AWS ACM SSL certificates.

---

## 🔍 Service Ports Quick Reference

| Service | Container Name | Port | Description |
|---------|----------------|------|-------------|
| **Next.js UI** | `nexus_pulse_app` | `3000` | NexusPulse Observability Dashboard |
| **Grafana** | `grafana` | `3001` | Visualization & metric boards |
| **Prometheus** | `prometheus` | `9090` | Time-series metrics engine |
| **Loki** | `loki` | `3100` | High-scale log aggregator |
| **Tempo** | `tempo` | `3200` | Distributed tracing backend |
| **Alertmanager** | `alertmanager` | `9093` | Alert routing & notification |
| **Promtail** | `promtail` | `9080` | Log shipper agent |
| **Node Exporter** | `node_exporter` | `9100` | OS/Host kernel metrics |
| **Blackbox Exporter** | `blackbox_exporter` | `9115` | External endpoint probing |
| **AWS CloudWatch** | `aws_cloudwatch_exporter` | `9106` | CloudWatch metrics integration |

---

## 🛠 Maintenance & Useful Commands

```bash
# Check running containers
docker compose -f docker-compose.prod.yml ps

# View live logs for specific service (e.g. app or prometheus)
docker compose -f docker-compose.prod.yml logs -f app
docker compose -f docker-compose.prod.yml logs -f prometheus

# Restart full stack
docker compose -f docker-compose.prod.yml restart

# Stop stack
docker compose -f docker-compose.prod.yml down
```

---

## 📄 License
MIT License. Built for high-reliability cloud and on-premise observability.
