# Hướng dẫn cấu hình CI/CD Deployment

## Cấu hình biến môi trường trong GitLab

Để CI/CD pipeline hoạt động, bạn cần cấu hình các biến môi trường sau trong GitLab:

### 1. Truy cập GitLab Project Settings
- Vào project GitLab của bạn
- Chọn **Settings** > **CI/CD**
- Mở rộng phần **Variables**

### 2. Thêm các biến môi trường sau:

#### Biến SSH và Server:
```
SSH_PRIVATE_KEY
- Type: Variable
- Environment scope: All
- Protected: Yes
- Masked: No
- Value: [Nội dung private key SSH của bạn]
```

```
DEPLOY_HOST
- Type: Variable  
- Environment scope: All
- Protected: Yes
- Masked: No
- Value: [IP hoặc domain của server deploy]
- Ví dụ: 192.168.1.100 hoặc dev.example.com
```

```
DEPLOY_USER
- Type: Variable
- Environment scope: All
- Protected: Yes
- Masked: No
- Value: [Username để SSH vào server]
- Ví dụ: deploy hoặc ubuntu
```

```
DEPLOY_PORT (Optional)
- Type: Variable
- Environment scope: All
- Protected: No
- Masked: No
- Value: [Port SSH, default là 22]
- Ví dụ: 22 hoặc 2222
```

## Thiết lập SSH Key

### 1. Tạo SSH Key pair (nếu chưa có):
```bash
ssh-keygen -t rsa -b 4096 -C "gitlab-ci@yourdomain.com"
```

### 2. Copy public key lên server:
```bash
ssh-copy-id -i ~/.ssh/id_rsa.pub user@your-server
```

### 3. Copy private key vào GitLab:
```bash
cat ~/.ssh/id_rsa
```
- Copy toàn bộ nội dung (bao gồm `-----BEGIN OPENSSH PRIVATE KEY-----` và `-----END OPENSSH PRIVATE KEY-----`)
- Paste vào biến `SSH_PRIVATE_KEY` trong GitLab

## Chuẩn bị Server

### 1. Cài đặt NVM và Node.js:
```bash
# Cài đặt NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload bash profile để nhận diện nvm command
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Hoặc restart terminal/SSH session
source ~/.bashrc

# Cài đặt Node.js version 14.19.1 qua NVM
nvm install 14.19.1
nvm use 14.19.1
nvm alias default 14.19.1

# Verify installation
node --version
npm --version
```

### 2. Cài đặt PM2:
```bash
# Cài đặt PM2 globally
npm install -g pm2

# Setup PM2 startup
pm2 startup
# Copy và chạy command được generate bởi pm2 startup
# Ví dụ: sudo env PATH=$PATH:/home/user/.nvm/versions/node/v14.19.1/bin /home/user/.nvm/versions/node/v14.19.1/lib/node_modules/pm2/bin/pm2 startup systemd -u user --hp /home/user

# Save PM2 configuration
pm2 save
```

**Lưu ý quan trọng**: Để đảm bảo NVM hoạt động trong SSH non-interactive sessions (GitLab CI), thêm các dòng sau vào file `~/.profile`:
```bash
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.profile
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.profile
echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> ~/.profile
```

**Node.js 14.19.1 Compatibility Notes**:
- Node.js 14.19.1 đi kèm với npm 6.x
- npm 6.x chỉ hỗ trợ `lockfileVersion: 1` 
- Project này có `lockfileVersion: 2` nên sử dụng `npm install` thay vì `npm ci`
- `npm install --production --no-audit --no-fund` đảm bảo compatibility và tốc độ

### 3. Tạo thư mục deploy:
```bash
sudo mkdir -p /home/deploy/api-luyenthitiendat
sudo chown -R $USER:$USER /home/deploy/
```

### 4. Cấu hình sudo cho deployment (nếu cần):
```bash
# Thêm vào file /etc/sudoers.d/deploy
echo "$USER ALL=(ALL) NOPASSWD: /bin/mkdir, /bin/cp, /bin/rm, /bin/tar, /bin/chown" | sudo tee /etc/sudoers.d/deploy
```

## Test Pipeline

### 1. Workflow sẽ chạy khi:
- Có merge request vào nhánh `develop`
- Có commit trực tiếp vào nhánh `develop`

### 2. Các stage sẽ chạy:
1. **Build**: Build application và tạo artifact
2. **Deploy**: Deploy lên server (manual trigger)

### 3. Manual deployment:
- Pipeline sẽ pause ở stage deploy
- Nhấn nút **Deploy** để trigger deployment
- Nhấn nút **Rollback** nếu cần rollback

## Troubleshooting

### Lỗi SSH Connection:
```bash
# Test SSH connection từ local
ssh -i ~/.ssh/id_rsa user@your-server

# Check SSH config trên server
sudo nano /etc/ssh/sshd_config
sudo systemctl restart ssh
```

### Lỗi Permission:
```bash
# Fix permission cho deploy directory
sudo chown -R $DEPLOY_USER:$DEPLOY_USER /home/deploy/
chmod -R 755 /home/deploy/
```

### Lỗi PM2:
```bash
# Reset PM2
pm2 kill
pm2 resurrect

# Check logs
pm2 logs api-luyenthitiendat
```

### Lỗi NVM/Node.js:
```bash
# Check nvm installation
nvm --version
command -v nvm

# List installed Node versions
nvm list

# Check current Node version
node --version
which node

# If nvm command not found, reload shell
source ~/.bashrc
# Or
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Reinstall PM2 if node version changed
npm install -g pm2
pm2 update
```

### Lỗi npm lockfileVersion compatibility:
```bash
# Nếu gặp lỗi npm ci với lockfileVersion >= 1
# Error: cipm can only install packages with lockfileVersion >= 1

# Solution 1: Sử dụng npm install thay vì npm ci
npm install --production --no-audit --no-fund

# Solution 2: Update npm version (nếu cần)
npm install -g npm@latest

# Solution 3: Generate lại package-lock.json với npm version hiện tại
rm package-lock.json
npm install
```

## Cấu trúc deployment:

```
/home/deploy/api-luyenthitiendat/     # Main application
/home/deploy/api-luyenthitiendat.backup/  # Backup for rollback
```

## Environment URLs:
- Development: http://your-server:4548
- Health check: http://your-server:4548/health (nếu có)

## Security Notes:
- Private key được mask trong GitLab variables
- SSH connection sử dụng key-based authentication
- Deploy job requires manual trigger để tránh deploy nhầm
- Có backup system cho rollback
- Server access bị giới hạn qua SSH key 