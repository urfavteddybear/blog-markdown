---
title: "Building a Kubernetes Cluster from Scratch: kubeadm Installation Guide"
date: "2025-01-17"
description: "Step-by-step tutorial to set up a production-ready Kubernetes cluster using kubeadm, including networking, storage, and essential add-ons."
tags: ["kubernetes", "kubeadm", "container-orchestration", "devops", "linux", "cluster"]
image: "/images/Fallback.webp"
---

# Building a Kubernetes Cluster from Scratch: kubeadm Installation Guide

Kubernetes has become the de facto standard for container orchestration. This comprehensive guide will walk you through setting up a production-ready Kubernetes cluster using kubeadm, from initial system preparation to deploying your first application.

## Prerequisites

Before starting, ensure you have:

- **At least 3 Linux servers** (1 master, 2+ worker nodes)
- **2 GB+ RAM per node** (4 GB recommended for master)
- **2+ CPU cores per node**
- **Network connectivity** between all nodes
- **Root or sudo access** on all nodes
- **Unique hostname, MAC address, and product_uuid** for each node

### Recommended Cluster Architecture

```
Master Node:  4 GB RAM, 2 CPUs, 20 GB disk
Worker Node:  2 GB RAM, 2 CPUs, 20 GB disk
Worker Node:  2 GB RAM, 2 CPUs, 20 GB disk
```

## System Preparation (All Nodes)

### Step 1: Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 2: Disable Swap

Kubernetes requires swap to be disabled:

```bash
sudo swapoff -a
sudo sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab
```

### Step 3: Configure Kernel Modules

```bash
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter
```

### Step 4: Configure sysctl Parameters

```bash
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sudo sysctl --system
```

### Step 5: Install Container Runtime (containerd)

```bash
# Install dependencies
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install containerd
sudo apt update
sudo apt install -y containerd.io

# Configure containerd
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml

# Enable SystemdCgroup
sudo sed -i 's/SystemdCgroup \= false/SystemdCgroup \= true/g' /etc/containerd/config.toml

# Restart containerd
sudo systemctl restart containerd
sudo systemctl enable containerd
```

### Step 6: Install kubeadm, kubelet, and kubectl

```bash
# Add Kubernetes signing key
sudo curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-archive-keyring.gpg

# Add Kubernetes repository
echo "deb [signed-by=/etc/apt/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list

# Install Kubernetes components
sudo apt update
sudo apt install -y kubelet kubeadm kubectl

# Hold packages to prevent automatic updates
sudo apt-mark hold kubelet kubeadm kubectl

# Enable kubelet
sudo systemctl enable kubelet
```

### Step 7: Configure Node Hostnames and Hosts File

Set unique hostnames on each node:

```bash
# Master node
sudo hostnamectl set-hostname k8s-master

# Worker nodes
sudo hostnamectl set-hostname k8s-worker-1
sudo hostnamectl set-hostname k8s-worker-2
```

Update `/etc/hosts` on all nodes:

```bash
sudo tee -a /etc/hosts <<EOF
192.168.1.100 k8s-master
192.168.1.101 k8s-worker-1
192.168.1.102 k8s-worker-2
EOF
```

## Initializing the Master Node

### Step 1: Initialize the Cluster

Run this command only on the master node:

```bash
sudo kubeadm init \
  --pod-network-cidr=10.244.0.0/16 \
  --apiserver-advertise-address=192.168.1.100 \
  --control-plane-endpoint=k8s-master
```

**Important**: Save the join command output for worker nodes!

### Step 2: Configure kubectl for Regular User

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

### Step 3: Verify Master Node Status

```bash
kubectl get nodes
kubectl get pods -A
```

At this point, the master node will show as "NotReady" because no CNI plugin is installed.

## Installing Container Network Interface (CNI)

### Option 1: Flannel (Recommended for Beginners)

```bash
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
```

### Option 2: Calico (Production Recommended)

```bash
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.26.1/manifests/tigera-operator.yaml
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.26.1/manifests/custom-resources.yaml
```

### Option 3: Weave Net

```bash
kubectl apply -f https://github.com/weaveworks/weave/releases/download/v2.8.1/weave-daemonset-k8s.yaml
```

### Verify CNI Installation

```bash
# Wait for all pods to be ready
kubectl get pods -A

# Check node status
kubectl get nodes
```

The master node should now show as "Ready".

## Joining Worker Nodes

### Step 1: Run Join Command on Worker Nodes

Use the join command from the kubeadm init output:

```bash
sudo kubeadm join k8s-master:6443 \
  --token <token> \
  --discovery-token-ca-cert-hash sha256:<hash>
```

If you lost the join command, generate a new one:

```bash
# On master node
kubeadm token create --print-join-command
```

### Step 2: Verify Cluster Status

From the master node:

```bash
kubectl get nodes -o wide
kubectl get pods -A
```

All nodes should show as "Ready".

## Essential Cluster Components

### Install Metrics Server

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Fix for self-signed certificates (if needed)
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'
```

### Install Kubernetes Dashboard

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml

# Create admin user
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kubernetes-dashboard
EOF

# Get access token
kubectl -n kubernetes-dashboard create token admin-user
```

Access the dashboard:

```bash
kubectl proxy --address=0.0.0.0 --disable-filter=true
```

Open: `http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/`

### Install Ingress Controller (NGINX)

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/baremetal/deploy.yaml

# Verify installation
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx
```

## Storage Configuration

### Install Local Path Provisioner

```bash
kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/v0.0.24/deploy/local-path-storage.yaml

# Set as default storage class
kubectl patch storageclass local-path -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'

# Verify
kubectl get storageclass
```

### Configure NFS Storage (Optional)

If you have an NFS server:

```bash
# Install NFS client on all nodes
sudo apt install -y nfs-common

# Create NFS storage class
cat <<EOF | kubectl apply -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: nfs
provisioner: kubernetes.io/no-provisioner
volumeBindingMode: WaitForFirstConsumer
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: nfs-pv
spec:
  capacity:
    storage: 100Gi
  accessModes:
    - ReadWriteMany
  nfs:
    server: your-nfs-server-ip
    path: /path/to/nfs/share
  storageClassName: nfs
EOF
```

## Testing the Cluster

### Deploy a Test Application

```bash
# Create deployment
kubectl create deployment nginx --image=nginx

# Expose deployment
kubectl expose deployment nginx --port=80 --type=NodePort

# Check status
kubectl get deployment,svc,pods

# Get service URL
kubectl get svc nginx
```

### Test Application Scaling

```bash
# Scale deployment
kubectl scale deployment nginx --replicas=3

# Check pods distribution
kubectl get pods -o wide

# Test load balancing
kubectl run -it --rm --restart=Never busybox --image=busybox -- wget -qO- nginx
```

### Create Ingress Resource

```bash
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: nginx.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nginx
            port:
              number: 80
EOF

# Add to /etc/hosts
echo "192.168.1.101 nginx.local" | sudo tee -a /etc/hosts
```

## Cluster Maintenance

### Adding New Worker Nodes

```bash
# Generate new join command on master
kubeadm token create --print-join-command

# Run on new worker node
sudo kubeadm join k8s-master:6443 --token <token> --discovery-token-ca-cert-hash sha256:<hash>
```

### Removing Nodes

```bash
# Drain node
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data

# Delete node
kubectl delete node <node-name>

# On the node being removed
sudo kubeadm reset
sudo iptables -F && sudo iptables -t nat -F && sudo iptables -t mangle -F && sudo iptables -X
```

### Upgrading the Cluster

```bash
# Upgrade kubeadm on master
sudo apt update
sudo apt install -y kubeadm=1.28.x-00

# Upgrade cluster
sudo kubeadm upgrade plan
sudo kubeadm upgrade apply v1.28.x

# Upgrade kubelet and kubectl
sudo apt install -y kubelet=1.28.x-00 kubectl=1.28.x-00
sudo systemctl restart kubelet
```

## Monitoring and Logging

### Install Prometheus and Grafana

```bash
# Add Prometheus Helm repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus stack
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace
```

### Useful kubectl Commands

```bash
# Cluster information
kubectl cluster-info
kubectl get nodes -o wide
kubectl top nodes

# Pod operations
kubectl get pods -A
kubectl describe pod <pod-name>
kubectl logs <pod-name>
kubectl exec -it <pod-name> -- /bin/bash

# Resource management
kubectl get all
kubectl get events
kubectl get pv,pvc
kubectl get ingress
```

## Security Best Practices

### Enable RBAC

```bash
# Create restricted user
kubectl create serviceaccount developer
kubectl create rolebinding developer-binding \
  --clusterrole=view \
  --serviceaccount=default:developer \
  --namespace=default
```

### Network Policies

```bash
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
EOF
```

### Pod Security Standards

```bash
kubectl label namespace default pod-security.kubernetes.io/enforce=restricted
kubectl label namespace default pod-security.kubernetes.io/audit=restricted
kubectl label namespace default pod-security.kubernetes.io/warn=restricted
```

## Troubleshooting Common Issues

### Cluster Not Starting

```bash
# Check kubelet logs
sudo journalctl -xeu kubelet

# Check containerd
sudo systemctl status containerd
sudo journalctl -u containerd

# Reset and retry
sudo kubeadm reset
sudo rm -rf /etc/cni/net.d
```

### Networking Issues

```bash
# Check CNI pods
kubectl get pods -n kube-system

# Test DNS resolution
kubectl run -it --rm --restart=Never busybox --image=busybox -- nslookup kubernetes.default

# Check iptables rules
sudo iptables -t nat -L
```

### Certificate Issues

```bash
# Check certificate expiration
sudo kubeadm certs check-expiration

# Renew certificates
sudo kubeadm certs renew all
sudo systemctl restart kubelet
```

## Conclusion

You now have a fully functional Kubernetes cluster with essential components installed. This setup provides a solid foundation for deploying containerized applications in a production-like environment.

Next steps to consider:
- Set up monitoring with Prometheus and Grafana
- Implement GitOps with ArgoCD or Flux
- Configure backup and disaster recovery
- Implement service mesh (Istio or Linkerd)
- Set up CI/CD pipelines

Remember to regularly update your cluster, monitor resource usage, and follow Kubernetes security best practices to maintain a healthy and secure environment.
