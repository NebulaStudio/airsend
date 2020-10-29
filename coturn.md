# centos 7 下，安装 coturn 服务

yum update

## 1. 安装 mongodb

- 配置 yum 源

```
cd /etc/yum.repos.d
vim mongodb-org-4.0.repo
```

添加以下内容

```
[mngodb-org]
name=MongoDB Repository
baseurl=http://mirrors.aliyun.com/mongodb/yum/redhat/7Server/mongodb-org/4.0/x86_64/
gpgcheck=0
enabled=1
```

执行命令

```
yum -y install mongodb-org
```

修改配置文件

```
vim /etc/mongod.conf
```

启动 mongodb

```
systemctl start mongod.service
```

创建用户

```
use coturn
db.createUser( {user: "coturn",pwd: "yourpassword",roles: [ { role: "dbOwner", db: "coturn" } ,{role: "dbAdmin", db: "coturn"}]})

```

## 2. 安装 cmake

下载地址: https://cmake.org/download/
解压并安装

```
tar -zxvf cmake-2.8.10.2.tar.gz
cd cmake-2.8.10.2
yum install -y gcc gcc-c++ make automake
yum install openssl
yum install openssl-devel
./bootstrap
gmake
gmake install
```

## 3. 安装 Mongo-drive

下载地址: https://github.com/mongodb/mongo-c-driver/releases
解压并安装

```
tar -zxvf mongo-c-driver-1.16.2.tar
cd mongo-c-driver-1.16.2
mkdir cmake-build
cd cmake-build
cmake -DENABLE_AUTOMATIC_INIT_AND_CLEANUP=OFF ..
make
make install
```

## 4. 安装 Mongocxx Driver

下载地址: https://github.com/mongodb/mongo-cxx-driver/releases
解压并安装

```
tar  -zxvf r3.2.1.tar.gz
cd mongo-cxx-driver-r3.2.1/build
yum install git
cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr/local ..
make EP_mnmlstc_core
make
make install
```

## 5. 安装 libevent2

下载地址: https://libevent.org/
解压并安装

```
tar -zxvf libevent-2.1.11-stable.tar.gz
cd libevent-2.1.11-stable/
yum install gcc
./configure -prefix=/usr
make
make install
```

## 6. 安装 coturn

下载地址: https://github.com/coturn/coturn/releases
解压并安装

```
tar  -zxvf coturn.tar.gz
yum install openssl-devel
yum install libevent-devel
./configure
make
make install
```

生成证书

```
openssl req -x509 -newkey rsa:2048 -keyout /usr/local/etc/turn_server_pkey.pem -out /usr/local/etc/turn_server_cert.pem -days 99999 -nodes
```

修改配置

```
vim /usr/local/etc/turnserver.conf
```

```
listening-ip=内网IP
relay-ip=内网IP
external-ip=公网IP
relay-threads=10
lt-cred-mech
realm=airsend
cert=/usr/local/etc/turn_server_cert.pem
pkey=/usr/local/etc/turn_server_pkey.pem
no-cli
mongo-userdb="mongodb://127.0.0.1:27017/airsend"
```

启动服务

```
turnserver -o -a -f -v -r airsend
```

完毕!
