---
description: Build và deploy dự án từ Jenkins trên VPS Ubuntu 22.04
---

# Jenkins Deployment Workflow

Workflow này hướng dẫn cách build và deploy dự án Node.js API từ Jenkins trên VPS Ubuntu 22.04.

## Bước 1: Cài đặt Jenkins trên Ubuntu 22.04

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Cài đặt Java (Jenkins yêu cầu Java)
sudo apt install -y openjdk-11-jdk

# Verify Java installation
java -version

# Thêm Jenkins repository key
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

# Thêm Jenkins repository
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Cài đặt Jenkins
sudo apt update
sudo apt install -y jenkins

# Start và enable Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Check status
sudo systemctl status jenkins
```

## Bước 2: Cấu hình Jenkins lần đầu

```bash
# Lấy initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword

# Truy cập Jenkins UI tại: http://YOUR_VPS_IP:8080
# Nhập password vừa lấy được
# Chọn "Install suggested plugins"
# Tạo admin user
```

## Bước 3: Cài đặt các dependencies cần thiết trên VPS

```bash
# Cài đặt Node.js và npm
curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v14.x
npm --version

# Cài đặt PM2 globally
sudo npm install -g pm2

# Setup PM2 startup
pm2 startup systemd
# Chạy command được generate bởi pm2 startup

# Cài đặt Git
sudo apt install -y git

# Tạo thư mục deploy
sudo mkdir -p /home/deploy/api-luyenthitiendat
sudo chown -R jenkins:jenkins /home/deploy/
```

## Bước 4: Cài đặt Jenkins plugins

Vào Jenkins UI → Manage Jenkins → Manage Plugins → Available plugins

Cài đặt các plugins sau:
- **NodeJS Plugin** - để build Node.js projects
- **Git Plugin** - để clone repository
- **SSH Agent Plugin** - để deploy qua SSH
- **Pipeline Plugin** - để sử dụng Jenkinsfile
- **Credentials Plugin** - để quản lý credentials

## Bước 5: Cấu hình NodeJS trong Jenkins

```
1. Vào: Manage Jenkins → Global Tool Configuration
2. Tìm phần "NodeJS"
3. Click "Add NodeJS"
4. Đặt tên: "NodeJS-14.19.1"
5. Chọn version: 14.19.1
6. Click "Save"
```

## Bước 6: Thêm Git credentials vào Jenkins

```
1. Vào: Manage Jenkins → Manage Credentials
2. Click vào "(global)" domain
3. Click "Add Credentials"
4. Chọn Kind: "Username with password" hoặc "SSH Username with private key"
5. Nhập thông tin Git của bạn
6. ID: "git-credentials"
7. Click "Create"
```

## Bước 7: Tạo Jenkins Pipeline Job

```
1. Vào Jenkins Dashboard
2. Click "New Item"
3. Nhập tên: "SSStudy-API-Deploy"
4. Chọn "Pipeline"
5. Click "OK"
```

## Bước 8: Cấu hình Pipeline

Trong phần Pipeline configuration, chọn:
- **Definition**: Pipeline script from SCM
- **SCM**: Git
- **Repository URL**: URL của Git repository
- **Credentials**: Chọn git-credentials đã tạo
- **Branch Specifier**: */sit (hoặc branch bạn muốn deploy)
- **Script Path**: Jenkinsfile

Click "Save"

## Bước 9: Tạo Jenkinsfile trong repository

Tạo file `Jenkinsfile` tại root của project với nội dung được tạo riêng.

## Bước 10: Chạy build

// turbo
```bash
# Trong Jenkins UI:
# 1. Vào job "SSStudy-API-Deploy"
# 2. Click "Build Now"
# 3. Xem logs trong "Console Output"
```

## Bước 11: Kiểm tra deployment

// turbo
```bash
# SSH vào VPS
ssh user@YOUR_VPS_IP

# Check PM2 status
pm2 list

# Check logs
pm2 logs api-luyenthitiendat

# Check application
curl http://localhost:3013
```

## Troubleshooting

### Jenkins không thể clone repository
```bash
# Kiểm tra Git credentials
# Kiểm tra network connectivity
# Kiểm tra firewall rules
```

### Build failed - npm install errors
```bash
# Kiểm tra Node.js version trong Jenkins
# Xóa node_modules và build lại
# Kiểm tra package.json dependencies
```

### PM2 không start được application
```bash
# Check PM2 logs
pm2 logs api-luyenthitiendat --lines 100

# Restart PM2
pm2 restart api-luyenthitiendat

# Check port conflicts
sudo netstat -tulpn | grep 3013
```

### Permission denied errors
```bash
# Fix Jenkins user permissions
sudo chown -R jenkins:jenkins /home/deploy/
sudo chmod -R 755 /home/deploy/

# Add jenkins user to necessary groups
sudo usermod -aG sudo jenkins
```

## Monitoring và Maintenance

```bash
# Xem Jenkins logs
sudo journalctl -u jenkins -f

# Restart Jenkins
sudo systemctl restart jenkins

# Backup Jenkins configuration
sudo tar -czf jenkins-backup-$(date +%Y%m%d).tar.gz /var/lib/jenkins/

# Update Jenkins
sudo apt update
sudo apt upgrade jenkins
```

## Security Best Practices

1. **Firewall**: Chỉ mở port 8080 cho IP cần thiết
```bash
sudo ufw allow from YOUR_IP to any port 8080
sudo ufw enable
```

2. **HTTPS**: Cài đặt SSL cho Jenkins
```bash
# Sử dụng Nginx reverse proxy với Let's Encrypt
sudo apt install -y nginx certbot python3-certbot-nginx
```

3. **Backup**: Tự động backup Jenkins configuration hàng ngày

4. **Updates**: Thường xuyên update Jenkins và plugins
