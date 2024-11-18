class Tank {
    /*
        Lớp Tank để mô tả các đối tượng xe tăng
    */
    constructor(idTank, x, y, idTeam, speed, health, rotation, rotationTurret) {
        this.idTank = idTank;
        this.health = health || 100;
        this.currentHealth = this.health;
        this.speed = speed || 2;
        this.rotation = 0; // đơn vị = độ
        this.rotationTurret = rotation || 0;
        this.speedRotation = rotationTurret || 2;
        this.trails = [];
        this.maxTrails = 15;
        this.x = x;
        this.y = y;
        this.bullets = [];
        this.idTeam = idTeam;
        this.color = undefined;
        this.action = undefined;
        this.status = "reborn";
    }

    addTrail() {
        /*
            Đây là hàm dùng để vẽ các vệt di chuyển của xe tăng
            Mỗi lần di chuyển, ta sẽ lưu lại tọa độ hiện tại của xe tăng
            Và sau khoảng thời gian nhất định, ta sẽ xóa điểm đầu tiên của mảng, ở đây chọn 100ms
        */

        // Thời gian để xóa vệt, chọn 100ms vì để đảm bảo vệt di chuyển không quá dài hoặc quá ngắn
        const TIME_TO_REMOVE = 100;

        // push(): thêm 1 phần tử vào cuối mảng
        this.trails.push({
            x: this.x,
            y: this.y,
        });

        // shift(): xóa phần tử đầu tiên của mảng
        setTimeout(() => {
            this.trails.shift();
        }, TIME_TO_REMOVE);
    }

    createBullet(typeBullet, color) {
        /*
            Đây là hàm dùng để tạo ra viên đạn
            Đối số typeBullet sẽ quyết định loại đạn
            - normalBullet: đạn bình thường
            - collisionBullet: đạn có khả năng phản ứng khi va chạm

            Mỗi lần tạo đạn, ta sẽ kiểm tra xem số lượng đạn đã tạo ra có vượt quá 25 viên không
            Nếu vượt quá thì sẽ không tạo thêm viên đạn nào nữa
        */

        const MAX_BULLETS = 10; // Số lượng đạn tối đa, chọn 25 vì để đảm bảo hiệu suất và tránh trường hợp quá nhiều đạn
        const MAX_COLLISION_OF_NORMAL_BULLET = 0; // Số lần va chạm cho phép của đạn bình thường (0: không va chạm)
        const MAX_COLLISION_OF_COLBULLET = 3; // Số lần va chạm cho phép của đạn phản ứng khi va chạm (3: va chạm 3 lần), chọn 3 để đảm bảo hiệu suất và tránh trường hợp quá nhiều va chạm
        const RED_COLOR = "#ff0000"; // Màu đỏ, dùng cho đạn bình thường
        const PURPLE_COLOR = "#ff00ff"; // Màu tím, dùng cho đạn phản ứng khi va chạm
        const NORMAL_SPEED = 4; // Tốc độ của đạn bình thường
        const COL_SPEED = 5; // Tốc độ của đạn phản ứng khi va chạm, mong muốn nhanh hơn đạn bình thường
        const NORMAL_DAMAGE = 10; // Sát thương của đạn bình thường
        const COL_DAMAGE = 15; // Sát thương của đạn phản ứng khi va chạm, mong muốn mạnh hơn đạn bình thường

        // Số lần va chạm cho phép của đạn
        const collision = typeBullet === "normalBullet" ? MAX_COLLISION_OF_NORMAL_BULLET : MAX_COLLISION_OF_COLBULLET;

        // Màu sắc, tốc độ và sát thương của đạn
        // const color = typeBullet === "normalBullet" ? RED_COLOR : PURPLE_COLOR;
        const speed = typeBullet === "normalBullet" ? NORMAL_SPEED : COL_SPEED;
        const damage = typeBullet === "normalBullet" ? NORMAL_DAMAGE : COL_DAMAGE;

        // Kiểm tra số lượng đạn đã tạo ra, nếu nhỏ hơn 25 thì mới tạo thêm viên đạn
        if (this.bullets.length < MAX_BULLETS) {
            // Tạo mới một đối tượng Bullet dựa vào các thuốc tính đã chọn
            this.bullets.push(new Bullet(this.x + 25, this.y + 25, this.rotationTurret, collision, color, speed, damage));
        }
    }

    handleBulletCollision(index, side) {
        /*
            Đây là hàm dùng để xử lý va chạm của viên đạn
            - index: vị trí của viên đạn trong mảng
            - side: true (va chạm với cạnh trái/phải), false (va chạm với cạnh trên/dưới)

            Kiểm tra viên đạn ở vị trí index có va chạm với cạnh không?
            Hàm handleCollision() dùng để kiểm tra va chạm và xử lý, đồng thời giảm số lần va chạm của viên đạn xuống
            Nếu số lần va chạm bằng 0 thì xóa viên đạn đạn đó đi
        */

        // Kiểm tra va chạm của viên đạn
        if (this.bullets[index].handleCollision(side)) {
            // Dùng hàm filter() để loại bỏ viên đạn ở vị trí index
            this.bullets = this.bullets.filter((bullet, i) => i != index);
        }
    }

    rotateLeft() {
        // Giảm góc quay của xe tăng
        this.rotation -= this.speedRotation;
    }

    rotateRight() {
        // Tăng góc quay của xe tăng
        this.rotation += this.speedRotation;
    }

    moveForward() {
        /*
            Hàm di chuyển xe tăng về phía trước
            Dựa vào góc quay và tọa độ lượng giác để tính toán vị trí mới
        */
        this.x += this.speed * Math.sin((this.rotation * Math.PI) / 180);
        this.y -= this.speed * Math.cos((this.rotation * Math.PI) / 180);

        // Thêm vệt di chuyển
        // this.addTrail();
    }

    moveBackward() {
        /*
            Hàm di chuyển xe tăng về phía sau
            Dựa vào góc quay và tọa độ lượng giác để tính toán vị trí mới
        */
        this.x -= this.speed * Math.sin((this.rotation * Math.PI) / 180);
        this.y += this.speed * Math.cos((this.rotation * Math.PI) / 180);

        // Thêm vệt di chuyển
        // this.addTrail();
    }

    rotateTurret(angle) {
        // Xoay nòng súng của xe tăng
        this.rotationTurret = angle;
    }

    setOutOfCanvas(canvas) {
        /*
            Hàm kiểm tra xe tăng có ra ngoài biên của canvas không
            Nếu ra ngoài thì đặt lại tọa độ cho xe tăng ở biên
        */
        // if (this.idTank === "BO"){
        //     if (this.x < 5) this.x = 50;
        //     if (this.x > 950) this.x = 950;
        //     if (this.y < 50) this.y = 50;
        //     if (this.y > 450) this.y = 450;
        // }

        if (this.x < 0) this.x = 0;
        if (this.x > 950) this.x = 950;
        if (this.y < 0) this.y = 0;
        if (this.y > 450) this.y = 450;
    }

    getBounds() {
        /*
            Hàm lấy ra các giới hạn của xe tăng
            - left: biên trái
            - right: biên phải
            - top: biên trên
            - bottom: biên dưới
        */

        // 25: bán kính của xe tăng (bao gồm cả thân xe và bánh xe)
        return {
            left: this.x,
            right: this.x + 50,
            top: this.y,
            bottom: this.y + 50,
        };
    }

    setDeepState(tank) {
        this.x = tank.x;
        this.y = tank.y;
        this.rotation = tank.rotation;
        this.rotationTurret = tank.rotationTurret;
        this.health = tank.health;
        this.currentHealth = tank.currentHealth;
        this.trails = tank.trails;

        tank.bullets.forEach((bullet) => {
            this.bullets.push(new Bullet(bullet.x, bullet.y, bullet.rotation, bullet.collision, bullet.color, bullet.speed, bullet.damage));
        });
    }
}

class Bullet {
    /*
        Lớp Bullet để mô tả các đối tượng viên đạn
    */
    constructor(x, y, rotation, collision, color, speed, damage) {
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.collision = collision; // Số lần được phép va chạm
        this.color = color;
        this.speed = speed || 0.4;
        this.damage = damage || 10;
    }

    handleCollision(condition) {
        /*
            Hàm xử lý va chạm của viên đạn
            - condition: true (va chạm với cạnh trái/phải), false (va chạm với cạnh trên/dưới)

            Hàm trả về true nếu viên đạn không được phép va chạm nữa (số va chạm bằng 0), ngược lại trả về false

            Nếu viên đạn va chạm với cạnh thì giảm số va chạm của viên đạn đi 1
            Nếu số va chạm bằng 0 (Tức viên đạn này không được phép va chạm nữa) thì trả về true (để xóa viên đạn) cho hàm handleBulletCollision()

            Nếu viên đạn va chạm với cạnh thì thay đổi hướng của viên đạn bằng cách đảo ngược góc quay (đảo vector)
        */

        if (this.collision == 0) {
            // Nếu số va chạm bằng 0 thì trả về true
            return true;
        } else {
            // Nếu số va chạm khác 0 thì giảm số va chạm đi 1
            this.collision -= 1;

            // Thay đổi hướng của viên đạn
            if (condition) {
                this.rotation = -this.rotation;
            } else {
                this.rotation = 180 - this.rotation;
            }
        }
        return false;
    }

    updatePosition() {
        /*
            Hàm cập nhật vị trí mới của viên đạn và trả về tọa độ mới
            Dùng trong việc kiểm tra va chạm với xe tăng
        */
        this.x += this.speed * Math.sin((this.rotation * Math.PI) / 180);
        this.y -= this.speed * Math.cos((this.rotation * Math.PI) / 180);

        // Trả về tọa độ mới của viên đạn
        return { newBulletX: this.x, newBulletY: this.y };
    }

    undoUpdatePosition() {
        /*
            Hàm hoàn tác vị trí của viên đạn
        */
        this.x -= this.speed * Math.sin((this.rotation * Math.PI) / 180);
        this.y += this.speed * Math.cos((this.rotation * Math.PI) / 180);
    }
}

class Utilities {
    /*
        Lớp Utilities chứa các hàm tiện ích và các hàm vẽ đối tượng trên canvas

        Các hàm chính:
            - clearRect(): Xóa vùng trên canvas
            - calculusAngle(): Tính góc quay giữa 2 đối tượng
            - drawRoundedRect(): Vẽ hình chữ nhật với góc bo tròn
            - hexToRgb(): Chuyển mã màu HEX sang RGB
            - rgbToHex(): Chuyển mã màu RGB sang HEX
            - interpolateColor(): Chuyển đổi mức độ thành màu sắc
            - getColorAtLevel(): Tính màu theo mức
            - drawBullets(): Vẽ viên đạn
            - drawTankTurret(): Vẽ nòng súng
            - drawTank(): Vẽ xe tăng
            - drawTrail(): Vẽ vệt di chuyển
            - getRandom(): Lấy số ngẫu nhiên
            - getIntRandom(): Lấy số nguyên ngẫu nhiên

     */
    clearRect(ctx, x, y, width, height) {
        /*
            Hàm xóa vùng trên canvas (Cụ thể hơn là xóa màn hình trò chơi)
            - ctx: context của canvas
            - x, y: tọa độ x, y của vùng cần xóa
            - width, height: chiều rộng và chiều cao của vùng cần xóa
        */
        ctx.clearRect(x, y, width, height);
    }

    calculusAngle(targetObj, otherObj) {
        /*
            Hàm tính góc cần quay để đối tượng A (targetObj) quay về đối tượng B (otherObj)
            - targetObj: đối tượng cần quay
            - otherObj: đối tượng cần đến

            Hàm này dùng công thức lượng giác (arctan) để tính góc quay giữa 2 đối tượng
        */
        var angle = (Math.atan((otherObj.y - targetObj.y) / (otherObj.x - targetObj.x)) * 180) / Math.PI - 90;

        // Vì hàm arctan chỉ tính góc từ -90 đến 90 nên cần kiểm tra thêm để tính góc từ -180 đến 180 (0 đến 360)
        if (otherObj.y - targetObj.y < 0 && otherObj.x - targetObj.x > 0) {
            angle += 180;
        }
        if (otherObj.y - targetObj.y > 0 && otherObj.x - targetObj.x > 0) {
            angle += 180;
        }

        // Trả về góc quay
        return angle;
    }

    drawRoundedRect(ctx, x, y, width, height, radius) {
        /*
            Hàm vẽ hình chữ nhật với góc bo tròn
            - ctx: context của canvas
            - x, y: tọa độ x, y của hình chữ nhật
            - width, height: chiều rộng và chiều cao của hình chữ nhật
            - radius: bán kính của góc bo tròn

            Cách hoạt động:
            - Vẽ 4 cạnh của hình chữ nhật
            - Vẽ 4 góc bo tròn
        */

        // Bắt đầu vẽ
        ctx.beginPath();
        ctx.moveTo(x + radius, y); // Điểm bắt đầu
        ctx.lineTo(x + width - radius, y); // Vẽ cạnh trên
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius); // Vẽ góc trên bên phải
        ctx.lineTo(x + width, y + height - radius); // Vẽ cạnh phải
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height); // Vẽ góc dưới bên phải
        ctx.lineTo(x + radius, y + height); // Vẽ cạnh dưới
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius); // Vẽ góc dưới bên trái
        ctx.lineTo(x, y + radius); // Vẽ cạnh trái
        ctx.quadraticCurveTo(x, y, x + radius, y); // Vẽ góc trên bên trái
        ctx.closePath(); // Kết thúc vẽ
        ctx.fill(); // Tô màu
    }

    hexToRgb(hex) {
        /* 
            Hàm chuyển đổi mã màu HEX sang RGB
            - hex: mã màu HEX cần chuyển đổi

            Cách hoạt động:
            - Chuyển mã màu HEX sang số nguyên ở hệ cơ số 16
            - Tách thành 3 mảng màu RGB
            - Trả về mảng màu RGB
        */

        let bigint = parseInt(hex.slice(1), 16);
        let r = (bigint >> 16) & 255; // dịch bit sang phải 16 bit và lấy 8 bit cuối
        let g = (bigint >> 8) & 255; // dịch bit sang phải 8 bit và lấy 8 bit cuối
        let b = bigint & 255; // lấy 8 bit cuối

        // Trả về mảng màu RGB
        return [r, g, b];
    }

    rgbToHex(rgb) {
        /* 
            Hàm chuyển đổi mã màu RGB sang HEX
            - rgb: mảng màu RGB cần chuyển đổi

            Cách hoạt động:
            - Chuyển từng phần tử mảng RGB sang hệ cơ số 16
            - Nếu độ dài của chuỗi HEX là 1 thì thêm số 0 vào trước để đủ 2 ký tự
            - Kết hợp chuỗi HEX và trả về
        */
        return (
            "#" +
            rgb
                .map((x) => {
                    const hex = x.toString(16); // Chuyển sang hệ cơ số 16
                    return hex.length === 1 ? "0" + hex : hex; // Nếu độ dài là 1 thì thêm số 0 vào trước
                })
                .join("")
        );
    }

    interpolateColor(color1, color2, factor) {
        /*
            Hàm chuyển đổi mức độ thành màu sắc, sự pha trộn giữa 2 màu
            - color1: màu gốc
            - color2: màu đích
            - factor: mức độ, từ 0 đến 1, gần 0 thì màu gần color1, gần 1 thì màu gần color2

            Cách hoạt động:
            - Sao chép mảng màu gốc
            - Tính toán màu mới dựa vào mức độ
            - Trả về mảng màu mới

            Dùng trong hàm getColorAtLevel() để chuyển đổi mức độ thành màu sắc
        */
        let result = color1.slice(); // copy mảng màu gốc, color1, color2 ở dạng mảng [r, g, b]
        for (let i = 0; i < 3; i++) {
            result[i] = Math.round(result[i] + factor * (color2[i] - color1[i])); // Tính toán màu mới
        }
        return result;
    }

    getColorAtLevel(baseHexColor, currentHealth, maxHealth) {
        /*
            Hàm chính để tính màu theo mức
            - baseHexColor: màu gốc (HEX)
            - currentHealth: mức máu hiện tại
            - maxHealth: mức máu tối đa

            Cách hoạt động:
            - Chuyển màu gốc từ HEX sang RGB
            - Tính mức độ từ 0 đến 1
            - Nếu mức độ từ 0 đến 1: nội suy giữa xám và màu gốc
            - Nếu mức độ từ 1 đến 2: nội suy giữa màu gốc và đen
            - Trả về màu HEX mới

            Áp dụng: Thể hiện mức máu của xe tăng thông qua màu sắc
            - Nếu xe tăng còn nhiều máu thì màu sẽ gần với màu xanh
            - Nếu xe tăng còn ít máu thì màu sẽ gần với màu đỏ
        */

        const grayColor = [150, 150, 150]; // Màu xám
        const blackColor = [0, 0, 0]; // Màu đen
        const baseColor = this.hexToRgb(baseHexColor); // Màu gốc (từ HEX sang RGB)
        const level = currentHealth / maxHealth; // Tính mức độ từ 0 đến 1

        let interpolatedColor;

        if (level <= 1) {
            // Nếu level từ 0 đến 1: nội suy giữa xám và màu gốc
            interpolatedColor = this.interpolateColor(grayColor, baseColor, level);
        } else {
            // Nếu level từ 1 đến 2: nội suy giữa màu gốc và đen
            interpolatedColor = this.interpolateColor(baseColor, blackColor, level - 1);
        }

        return this.rgbToHex(interpolatedColor);
    }

    drawBullets(ctx, tank) {
        /*
            Hàm vẽ lại tất cả các viên đạn hiện có của xe tăng
            - ctx: context của canvas
            - tank: đối tượng xe tăng đang cần vẽ đạn
        */

        for (let i = 0; i < tank.bullets.length; i++) {
            // Vẽ trên canvas
            ctx.beginPath();
            ctx.arc(tank.bullets[i].x, tank.bullets[i].y, 5, 0, 2 * Math.PI); // Vẽ hình tròn, bán kính 5, tâm ở tọa độ x, y, bắt đầu từ 0 đến 2*PI
            ctx.fillStyle = tank.bullets[i].color;
            ctx.fill();

            // Cập nhật vị trí mới của viên đạn, đồng thời kiểm tra va chạm
            if (tank.bullets[i].x < 0 || tank.bullets[i].x > canvas.width) {
                // Nếu viên đạn ra khỏi biên trái/phải
                tank.handleBulletCollision(i, true); // Xử lý va chạm
            } else if (tank.bullets[i].y < 0 || tank.bullets[i].y > canvas.height) {
                // Nếu viên đạn ra khỏi biên trên/dưới
                tank.handleBulletCollision(i, false); // Xử lý va chạm
            }
        }
    }

    drawTankTurret(ctx, tank) {
        /*
            Hàm vẽ nòng súng của xe tăng
            - ctx: context của canvas
            - tank: đối tượng xe tăng đang cần vẽ nòng súng

            Hàm này để vẽ nòng súng của xe tăng, dựa vào tọa độ và góc quay của xe tăng
            Đồng thời vẽ hình ngũ giác trên thân xe tăng
        */

        const { x, y, rotationTurret } = tank;
        ctx.save();
        ctx.translate(x + 25, y + 25);
        ctx.rotate((rotationTurret * Math.PI) / 180);
        ctx.fillStyle = tank.color;
        // ctx.fillStyle = this.getColorAtLevel(tank.color, tank.currentHealth + 30, tank.health);
        ctx.fillRect(-7, -45, 14, 5);
        // ctx.fillStyle = this.getColorAtLevel(tank.color, tank.currentHealth + 15, tank.health);
        ctx.fillRect(-4, -40, 8, 28);
        let r = 12 / Math.sin((54 * Math.PI) / 180);
        ctx.beginPath();
        let theta = (2 * Math.PI) / 5;
        let theta0 = (54 * Math.PI) / 180;
        // ctx.translate(-25, -25);
        ctx.moveTo(r * Math.cos(theta0), -r * Math.sin(theta0));
        for (var i = 1; i <= 4; i++) {
            ctx.lineTo(r * Math.cos(theta0 + i * theta), -r * Math.sin(theta0 + i * theta));
        }
        ctx.closePath();
        // ctx.fillStyle = this.getColorAtLevel(tank.color, tank.currentHealth - 30, tank.health);
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.restore();
    }

    drawTank(ctx, tank) {
        /*
            Hàm vẽ xe tăng

            - ctx: context của canvas
            - tank: đối tượng xe tăng cần vẽ

            Hàm này để vẽ xe tăng, dựa vào tọa độ, góc quay và màu sắc của xe tăng
            Để vẽ xe tăng thì ta vẽ thân xe tăng sau đó đến 2 bánh xe
        */

        // if (tank.status === "exploded") {
        //     this.explode(tank.x + 25, tank.y + 25, ctx, canvas);
        //     tank.status = "destroyed";
        //     return;
        // }

        const { x, y, rotation } = tank;
        ctx.save();
        ctx.translate(x + 25, y + 25);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-25, -25);
        ctx.fillStyle = tank.color;
        this.drawRoundedRect(ctx, 10, 10, 30, 30, 0);
        this.drawRoundedRect(ctx, 0, 0, 10, 50, 5);
        this.drawRoundedRect(ctx, 40, 0, 10, 50, 5);

        ctx.restore();

        this.drawHealthBar(ctx, tank);
        this.drawPlayerName(ctx, tank.idTank, tank.x, tank.y);
    }

    drawProtectedTank(ctx, tank) {
        const { x, y } = tank;
        ctx.save();
        ctx.translate(x, y);
        if (tank.status === "protected") {
            ctx.fillStyle = "rgba(255, 255, 0, " + (0.1 + 0.6 * Math.abs(Math.sin(Date.now() / 300))) + ")";
            this.drawRoundedRect(ctx, -15, -15, 80, 80, 40);
        }
        ctx.restore();
    }

    drawHealthBar(ctx, tank) {
        var { x, y, currentHealth } = tank; // Giả sử đối tượng tank có thuộc tính health
        const maxHealth = 100; // Giá trị tối đa của máu
        const barWidth = 70; // Chiều rộng thanh máu
        const barHeight = 10; // Chiều cao thanh máu

        // Tọa độ cho thanh máu, đặt trên thân xe tăng
        const barX = x - 10; // Căn giữa thanh máu
        const barY = y - 15; // Đặt thanh máu trên thân xe tăng

        // Vẽ nền cho thanh máu (màu đen)
        ctx.fillStyle = "black";
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Tính toán chiều dài của phần máu đầy và phần máu bị mất
        const healthWidth = (currentHealth / maxHealth) * barWidth;

        // Vẽ phần máu đầy (màu xanh lá cây)
        ctx.fillStyle = "green";
        ctx.fillRect(barX, barY, healthWidth, barHeight);

        // Vẽ phần máu bị mất (màu đỏ)
        if (currentHealth < maxHealth) {
            ctx.fillStyle = "red";
            ctx.fillRect(barX + healthWidth, barY, barWidth - healthWidth, barHeight);
        }
    }

    drawPlayerName(ctx, playerName, x, y) {
        ctx.save();
        ctx.font = "12px Arial"; // Phông chữ
        ctx.textAlign = "center"; // Căn giữa
        ctx.textBaseline = "middle"; // Căn giữa theo chiều dọc

        // Vẽ viền đen
        ctx.fillStyle = "black";
        ctx.fillText(playerName, x + 25, y - 15);
        ctx.fillText(playerName, x + 25 + 1, y - 15); // Đẩy nhẹ qua phải
        ctx.fillText(playerName, x + 25 - 1, y - 15); // Đẩy nhẹ qua trái
        ctx.fillText(playerName, x + 25, y - 15 + 1); // Đẩy nhẹ xuống
        ctx.fillText(playerName, x + 25, y - 15 - 1); // Đẩy nhẹ lên

        // Vẽ chữ trắng
        ctx.fillStyle = "white";
        ctx.fillText(playerName, x + 25, y - 15);

        ctx.restore();
    }

    drawTrail(ctx, tank) {
        /*
            Hàm vẽ vệt di chuyển của xe tăng
            - ctx: context của canvas
            - tank: đối tượng xe tăng cần vẽ vệt di chuyển

        */
        for (let i = 0; i < tank.trails.length; i++) {
            ctx.beginPath();
            ctx.arc(tank.trails[i].x + 25, tank.trails[i].y + 25, 10, 0, 2 * Math.PI);
            ctx.fillStyle = tank.color;
            ctx.fill();
        }
    }

    explode(x, y, ctx, color) {
        const particles = [];

        for (let i = 0; i <= 150; i++) {
            let dx = (Math.random() - 0.5) * (Math.random() * 3);
            let dy = (Math.random() - 0.5) * (Math.random() * 3);
            let radius = Math.random() * 4;
            let particle = new Particle(x, y, radius, dx, dy, ctx, color);

            particles.push(particle);
        }

        /* Clears the given pixels in the rectangle */
        function animateParticles() {
            // this.clearRect(ctx, 0, 0, canvas.width, canvas.height);
            particles.forEach((particle, i) => {
                if (particle.alpha <= 0) {
                    particles.splice(i, 1);
                } else {
                    particle.update();
                }
            });
            if (particles.length > 0) {
                requestAnimationFrame(animateParticles);
            }
        }

        animateParticles();
    }

    getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }

    getIntRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    isColliding(rect1, rect2) {
        return !(rect1.right <= rect2.left || rect1.left >= rect2.right || rect1.bottom <= rect2.top || rect1.top >= rect2.bottom);
    }

    // Hàm kiểm tra va chạm giữa hai hình chữ nhật và xác định cạnh va chạm
    getCollisionSides(tankBounds, wallRect) {
        // Kiểm tra va chạm
        if (!this.isColliding(tankBounds, wallRect)) {
            return {
                collision: null,
                overlap: null,
            }; // Không có va chạm
        }

        // Tính toán sự chồng lấp
        const overlapX = Math.min(tankBounds.right, wallRect.right) - Math.max(tankBounds.left, wallRect.left);
        const overlapY = Math.min(tankBounds.bottom, wallRect.bottom) - Math.max(tankBounds.top, wallRect.top);

        // Tính trung tâm của xe tăng và tường để xác định hướng va chạm
        const tankCenterX = (tankBounds.left + tankBounds.right) / 2;
        const tankCenterY = (tankBounds.top + tankBounds.bottom) / 2;
        const wallCenterX = (wallRect.left + wallRect.right) / 2;
        const wallCenterY = (wallRect.top + wallRect.bottom) / 2;

        let collision = {};
        let overlap;

        if (overlapX < overlapY) {
            overlap = overlapY;
            // Va chạm theo hướng ngang
            if (tankCenterX > wallCenterX) {
                // Cạnh phải của xe tăng va chạm với cạnh trái của tường
                collision.tankSide = "left";
                collision.wallSide = "right";
            } else {
                // Cạnh trái của xe tăng va chạm với cạnh phải của tường
                collision.tankSide = "right";
                collision.wallSide = "left";
            }
        } else {
            overlap = overlapX;
            // Va chạm theo hướng dọc
            if (tankCenterY > wallCenterY) {
                // Cạnh dưới của xe tăng va chạm với cạnh trên của tường
                collision.tankSide = "top";
                collision.wallSide = "bottom";
            } else {
                // Cạnh trên của xe tăng va chạm với cạnh dưới của tường
                collision.tankSide = "bottom";
                collision.wallSide = "top";
            }
        }

        return { collision, overlap: overlapX * overlapY }; // Trả về đối tượng chứa thông tin về cạnh va chạm
    }
}

class Game {
    /*
        Đây là lớp Game chứa các hàm xử lý game

        Các hàm chính:
            - constructor(): Hàm khởi tạo
            - setMap(): Hàm thiết lập map
            - buildMap(): Hàm để tính toán vị trí của các tường trùng với tường khác
                + Giúp cho việc xử lý va chạm trên tường
            - addTank(): Hàm thêm xe tăng
            - controlTank(): Hàm điều khiển xe tăng
            - getTank(): Hàm lấy xe tăng
            - controlBot(): Hàm điều khiển bot
            - detectAndHandleBulletCollision(): Hàm xử lý va chạm trên xe tăng
            - detectCollisionOnBullet(): Hàm xử lý va chạm trên đạn
            - updateGame(): Hàm cập nhật game
            - drawGame(): Hàm vẽ game
            - endGame(): Hàm kết thúc game

    */
    constructor(canvas) {
        this.tanks = [];
        this.endGame = false;
        this.canvas = canvas;
        if (canvas) this.ctx = canvas.getContext("2d");
        this.utilities = new Utilities();
        this.listColor = ["#5678F0", "#EB5757"];
        this.teamColor = {};
        this.map = null;
        this.possibleMoves = ["moveHead", "moveBack", "moveLeft", "moveRight", "aim"];
    }

    setMap(map) {
        /* 
            Cấu trúc của map:
            - sideDogX: vị trí x của nhà chó
            - sideDogY: vị trí y của nhà chó
            - homeSize: kích thước nhà
            - sideCatX: vị trí x của nhà mèo
            - sideCatY: vị trí y của nhà mèo
            - homeDogColor: màu sắc nhà chó
            - homeCatColor: màu sắc nhà mèo
            - wallSize: kích thước tường
            - wallPositions[]: Danh sách vị trí tường
        */
        this.map = map;
        this.map.wallPositions = [];
        this.buildMap();
    }

    buildMap() {
        this.map.adjacentWall = {};

        for (var i = 0; i < this.map.wallPositions.length; i++) {
            this.map.adjacentWall[i] = [];
        }

        for (var i = 0; i < this.map.wallPositions.length - 1; i++) {
            const wallRectI = {
                left: this.map.wallPositions[i].x,
                right: this.map.wallPositions[i].x + this.map.wallSize,
                top: this.map.wallPositions[i].y,
                bottom: this.map.wallPositions[i].y + this.map.wallSize,
            };
            for (var j = i + 1; j < this.map.wallPositions.length; j++) {
                const wallRectJ = {
                    left: this.map.wallPositions[j].x,
                    right: this.map.wallPositions[j].x + this.map.wallSize,
                    top: this.map.wallPositions[j].y,
                    bottom: this.map.wallPositions[j].y + this.map.wallSize,
                };

                if (wallRectI.left === wallRectJ.right && wallRectI.top === wallRectJ.top) {
                    this.map.adjacentWall[i].push("left");
                    this.map.adjacentWall[j].push("right");
                }

                if (wallRectI.right === wallRectJ.left && wallRectI.top === wallRectJ.top) {
                    this.map.adjacentWall[i].push("right");
                    this.map.adjacentWall[j].push("left");
                }

                if (wallRectI.top === wallRectJ.bottom && wallRectI.left === wallRectJ.left) {
                    this.map.adjacentWall[i].push("top");
                    this.map.adjacentWall[j].push("bottom");
                }

                if (wallRectI.bottom === wallRectJ.top && wallRectI.left === wallRectJ.left) {
                    this.map.adjacentWall[i].push("bottom");
                    this.map.adjacentWall[j].push("top");
                }
            }
        }
    }

    addTank(idTank, x, y, idTeam) {
        /*
            Hàm thêm xe tăng
            - idTank: id của xe tăng
            - x, y: tọa độ x, y của xe tăng
            - idTeam: id nhóm của xe tăng

            Sau đó đặt màu cho xe tăng của đội đó bằng cách:
            - Kiểm tra đội đó đã có màu hay chưa?
            - Nếu chưa có thì random một màu và gán màu
            - Nếu có rồi thì sẽ đặt màu cho xe tăng đó theo team 
        */

        this.tanks.push(new Tank(idTank, x, y, idTeam));

        if (this.teamColor[idTeam] === undefined) {
            // teamColor là một Object
            const indexColor = this.utilities.getIntRandom(0, this.listColor.length - 1);
            this.teamColor[idTeam] = this.listColor[indexColor];
            this.listColor.splice(indexColor, 1);
        }

        this.tanks[this.tanks.length - 1].color = this.teamColor[idTeam];
    }

    controlTank(idTank, action, angle) {
        /*
            Hàm dùng để điều khiển xe tăng có id là idTank với hành động action
        */
        for (var i = 0; i < this.tanks.length; i++) {
            if (this.tanks[i].idTank === idTank) {
                if (action == "moveHead") {
                    this.tanks[i].rotation = 0;
                    action = "moveForward";
                }
                if (action == "moveBack") {
                    this.tanks[i].rotation = 180;
                    action = "moveForward";
                }
                if (action == "moveLeft") {
                    this.tanks[i].rotation = 270;
                    action = "moveForward";
                }
                if (action == "moveRight") {
                    this.tanks[i].rotation = 90;
                    action = "moveForward";
                }
                if (action == "rotateLeft") {
                    this.tanks[i].rotateLeft();
                }
                if (action == "rotateRight") {
                    this.tanks[i].rotateRight();
                }
                if (action == "moveForward") {
                    const preY = this.tanks[i].y;
                    this.tanks[i].moveForward();
                    this.tanks[i].setOutOfCanvas(this.canvas);
                    const lastY = this.tanks[i].y;

                    const bounds = this.tanks[i].getBounds();
                    var mainCollision = null;
                    var maxOverlap = 0;
                    var boundsWallMain;
                    for (var j = 0; j < this.map.wallPositions.length; j++) {
                        const boundsWall = {
                            left: this.map.wallPositions[j].x,
                            right: this.map.wallPositions[j].x + this.map.wallSize,
                            top: this.map.wallPositions[j].y,
                            bottom: this.map.wallPositions[j].y + this.map.wallSize,
                        };
                        const { collision, overlap } = this.utilities.getCollisionSides(bounds, boundsWall);
                        if (collision) {
                            if (overlap > maxOverlap) {
                                mainCollision = collision;
                                maxOverlap = overlap;
                                boundsWallMain = boundsWall;
                            }
                        }
                    }
                    if (mainCollision) {
                        if (mainCollision.wallSide == "left") {
                            this.tanks[i].x = boundsWallMain.left - 50;
                        }
                        if (mainCollision.wallSide == "right") {
                            this.tanks[i].x = boundsWallMain.right;
                        }
                        if (mainCollision.wallSide == "top" && lastY > preY) {
                            this.tanks[i].y = boundsWallMain.top - 50;
                        }
                        if (mainCollision.wallSide == "bottom") {
                            this.tanks[i].y = boundsWallMain.bottom;
                        }
                    }
                }
                if (action == "moveBackward") {
                    const preY = this.tanks[i].y;
                    this.tanks[i].moveBackward();
                    this.tanks[i].setOutOfCanvas(this.canvas);
                    const lastY = this.tanks[i].y;

                    const bounds = this.tanks[i].getBounds();
                    var mainCollision = null;
                    var maxOverlap = 0;
                    var boundsWallMain;
                    for (var j = 0; j < this.map.wallPositions.length; j++) {
                        const boundsWall = {
                            left: this.map.wallPositions[j].x,
                            right: this.map.wallPositions[j].x + this.map.wallSize,
                            top: this.map.wallPositions[j].y,
                            bottom: this.map.wallPositions[j].y + this.map.wallSize,
                        };
                        const { collision, overlap } = this.utilities.getCollisionSides(bounds, boundsWall);
                        if (collision) {
                            if (overlap > maxOverlap) {
                                mainCollision = collision;
                                maxOverlap = overlap;
                                boundsWallMain = boundsWall;
                            }
                        }
                    }
                    if (mainCollision) {
                        if (mainCollision.wallSide == "left") {
                            this.tanks[i].x = boundsWallMain.left - 50;
                        }
                        if (mainCollision.wallSide == "right") {
                            this.tanks[i].x = boundsWallMain.right;
                        }
                        if (mainCollision.wallSide == "top") {
                            this.tanks[i].y = boundsWallMain.top - 50;
                        }
                        if (mainCollision.wallSide == "bottom" && lastY < preY) {
                            this.tanks[i].y = boundsWallMain.bottom;
                        }
                    }
                }
                if (action == "fire") {
                    this.tanks[i].createBullet("purpleBullet", this.tanks[i].color);
                }
                if (action == "aim") {
                    // console.log("aim");
                    const tankPlayer = this.tanks.find((tank) => tank.idTank !== idTank);
                    const angle = this.utilities.calculusAngle(this.tanks[i], tankPlayer);
                    this.tanks[i].rotationTurret = angle;
                    this.tanks[i].createBullet("purpleBullet", this.tanks[i].color);
                }
            }
        }
    }

    getTank(idTank) {
        /* 
            Hàm lấy xe tăng theo idTank
        */
        for (var i = 0; i < this.tanks.length; i++) {
            if (this.tanks[i].idTank === idTank) {
                return this.tanks[i];
            }
        }
    }

    controlBot() {
        /*
            Hàm điều khiển bot, cách hoạt động:
            - Duyệt qua tất cả các xe tăng
            - Nếu xe tăng đó có idTeam là BOT thì sẽ thực hiện hành động ngẫu nhiên
            - Hành động ngẫu nhiên sẽ được chọn từ 0 đến 4 tương ứng với các hành động:
                + 0: di chuyển về phía trước
                + 1: di chuyển về phía sau
                + 2: quay trái
                + 3: quay phải
                + 4: bắn đạn
            - Nếu hành động là bắn đạn thì sẽ chọn loại đạn ngẫu nhiên
            - Đầu tiên sẽ chọn một xe tăng ngẫu nhiên trong đội đối phương
            - Tính góc quay giữa 2 xe tăng
            - Tính tỉ lệ ngẫu nhiên để chọn loại đạn
            - Tỉ lệ các loại đạn:
                + 5%: bắn đàn chùm (5 viên)
                + 10%: bắn đạn nẩy
                + 5%: bắn đạn thường (ngẫu nhiên tăng hoặc giảm 10 độ với xác suất 10%)
        */
        for (var i = 0; i < this.tanks.length; i++) {
            if (this.tanks[i].idTeam === "BOT") {
                if (this.tanks[i].action === undefined || this.utilities.getIntRandom(0, 200) < 10) {
                    this.tanks[i].action = this.utilities.getIntRandom(0, 4);
                }
                switch (this.tanks[i].action) {
                    case 0:
                        this.controlTank(this.tanks[i].idTank, "moveForward");
                        break;
                    case 1:
                        this.controlTank(this.tanks[i].idTank, "moveBackward");
                        break;
                    case 2:
                        this.controlTank(this.tanks[i].idTank, "rotateLeft");
                        break;
                    case 3:
                        this.controlTank(this.tanks[i].idTank, "rotateRight");
                        break;
                    case 4:
                        const listTankInDifferentTeam = this.tanks.filter((tank) => tank.idTeam !== this.tanks[i].idTeam);
                        const targetTank = listTankInDifferentTeam[this.utilities.getIntRandom(0, listTankInDifferentTeam.length - 1)];
                        var angle = this.utilities.calculusAngle(this.tanks[i], targetTank);
                        const activeBulletRate = this.utilities.getIntRandom(0, 100);
                        if (activeBulletRate < 5) {
                            for (let j = -3; j < 3; j++) {
                                this.tanks[i].rotationTurret = angle + 5 * j;

                                this.tanks[i].createBullet("normalBullet");
                            }
                        } else if (activeBulletRate < 15) {
                            this.tanks[i].rotationTurret = angle;
                            this.tanks[i].createBullet("collisionBullet");
                        } else if (activeBulletRate < 20) {
                            if (this.utilities.getIntRandom(0, 10) === 0) {
                                angle += 10;
                            }
                            if (this.utilities.getIntRandom(0, 10) === 1) {
                                angle -= 10;
                            }
                            this.tanks[i].rotationTurret = angle;
                            this.tanks[i].createBullet("normalBullet");
                        }
                        this.tanks[i].action = undefined;

                        break;
                }
            }
        }
    }

    detectAndHandleBulletCollision() {
        /*
            Hàm xử lý va chạm trên xe tăng
            - Duyệt qua tất cả các xe tăng
            - Duyệt qua tất cả các viên đạn của xe tăng
            - Duyệt qua vị trí của các tường
            - Kiểm tra xem viên đạn có va chạm với tường không
            - Kiểm tra xem viên đạn có va chạm với xe tăng không
            - Nếu có va chạm thì giảm máu của xe tăng và xử lý va chạm
            - Nếu máu của xe tăng bằng 0 thì xóa xe tăng
        */
        var listBoundariesOfTank = [];
        // Duyệt qua các xe tăng và tạo ra mảng chứa các giới hạn của xe tăng và id của nó
        // Mục đích là để tối ưu, tránh phải duyệt qua các xe tăng một lần nữa
        for (var i = 0; i < this.tanks.length; i++) {
            var tank = this.tanks[i];
            const haftSide = 50;
            const xMin = tank.x;
            const xMax = tank.x + haftSide;
            const yMin = tank.y;
            const yMax = tank.y + haftSide;
            // Góc trên trái và góc dưới phải của xe tăng
            listBoundariesOfTank.push({ xMin, xMax, yMin, yMax, indexTank: i });
        }
        // Duyệt qua các xe tăng
        for (var i = 0; i < this.tanks.length; i++) {
            // Duyệt qua các viên đạn của xe tăng
            for (var j = 0; j < this.tanks[i].bullets.length; j++) {
                // Lấy tọa độ mới của viên đạn
                const { newBulletX, newBulletY } = this.tanks[i].bullets[j].updatePosition();
                // console.log(newBulletX, newBulletY);

                // Duyệt qua vị trí của các tường (ô vuông)
                for (var k = 0; k < this.map.wallPositions.length; k++) {
                    const wallRect = {
                        left: this.map.wallPositions[k].x,
                        right: this.map.wallPositions[k].x + this.map.wallSize,
                        top: this.map.wallPositions[k].y,
                        bottom: this.map.wallPositions[k].y + this.map.wallSize,
                    };

                    // sử dụng try catch để bắt lỗi khi viên đạn bị xóa, dẫn đến lỗi khi truy cập thuộc tính x, y của viên đạn tiếp theo
                    try {
                        // Kiểm tra xem viên đạn có va chạm với tường không bằng cách kiểm tra tọa độ của viên đạn có nằm trong vùng của tường không
                        if (
                            newBulletX >= wallRect.left &&
                            newBulletX <= wallRect.right &&
                            newBulletY >= wallRect.top &&
                            newBulletY <= wallRect.bottom
                        ) {
                            // console.log(wallRect);
                            // Nếu có thì kiểm tra va chạm với cạnh nào của tường

                            // Khoảng cách đến cạnh trái
                            const distanceToLeft = this.map.adjacentWall[k].includes("left") ? Infinity : newBulletX - wallRect.left;
                            // Khoảng cách đến cạnh phải
                            const distanceToRight = this.map.adjacentWall[k].includes("right") ? Infinity : wallRect.right - newBulletX;
                            // Khoảng cách đến cạnh trên
                            const distanceToTop = this.map.adjacentWall[k].includes("top") ? Infinity : newBulletY - wallRect.top;
                            // Khoảng cách đến cạnh dưới
                            const distanceToBottom = this.map.adjacentWall[k].includes("bottom") ? Infinity : wallRect.bottom - newBulletY;

                            // Cạnh bị trúng sẽ là cạnh có khoảng cách nhỏ nhất
                            // Tìm khoảng cách nhỏ nhất
                            let minDistance = Math.min(distanceToLeft, distanceToRight, distanceToTop, distanceToBottom);

                            if (minDistance === distanceToLeft) {
                                console.log("left");
                            }
                            if (minDistance === distanceToRight) {
                                console.log("right");
                            }
                            if (minDistance === distanceToTop) {
                                console.log("top");
                            }
                            if (minDistance === distanceToBottom) {
                                console.log("bottom");
                            }

                            // Xử lý va chạm
                            if (minDistance === distanceToLeft || minDistance === distanceToRight) {
                                this.tanks[i].handleBulletCollision(j, true);
                                // this.tanks[i].bullets[j].updatePosition();
                            }
                            if (minDistance === distanceToTop || minDistance === distanceToBottom) {
                                this.tanks[i].handleBulletCollision(j, false);
                                // this.tanks[i].bullets[j].updatePosition();
                            }
                            // console.log(this.tanks[i].bullets[j].collision);
                            // console.log(this.tanks[i].bullets[j].rotation);

                            break;
                        }

                        // Nếu viên đạn trúng tường thì sẽ không trúng xe tăng nữa (trong cùng một thời điểm)
                        // Nên duyệt qua viên đạn tiếp theo
                        // continue;
                    } catch (e) {
                        console.log(e);
                        continue;
                    }
                }

                // Duyệt qua vị trí của các xe tăng và kiểm tra va chạm
                for (var k = 0; k < listBoundariesOfTank.length; k++) {
                    // Lấy tọa độ các cạnh (góc trên trái và góc dưới phải) của xe tăng
                    const { xMin, xMax, yMin, yMax, indexTank } = listBoundariesOfTank[k];
                    // Kiểm tra xem viên đạn có va chạm với xe tăng không bằng cách kiểm tra tọa độ của viên đạn có nằm trong vùng của xe tăng không
                    if (newBulletX >= xMin && newBulletX <= xMax && newBulletY >= yMin && newBulletY <= yMax) {
                        // Nếu viên đạn va chạm với xe tăng của đồng đội thì bỏ qua
                        if (this.tanks[i].idTeam === this.tanks[indexTank].idTeam) {
                            continue;
                        }

                        // Nếu không trúng xe tăng của đồng đội thì tức đang trúng xe tăng của địch
                        // Khi đó sẽ giảm máu của xe tăng và xử lý va chạm
                        this.tanks[indexTank].currentHealth -= this.tanks[i].bullets[j].damage;
                        if (this.tanks[indexTank].status === "protected") {
                            this.tanks[indexTank].currentHealth = this.tanks[indexTank].health;
                        }
                        if (this.tanks[indexTank].status === "destroyed") {
                            continue;
                        }
                        // Thay đổi màu của xe tăng dựa vào mức máu
                        // this.tanks[indexTank].color = this.utilities.getColorAtLevel(
                        //     this.tanks[indexTank].color,
                        //     this.tanks[indexTank].currentHealth,
                        //     this.tanks[indexTank].health
                        // );

                        // Kiểm tra xem viên đạn đang trúng vào cạnh nào của xe tăng mục tiêu
                        // Để kiểm tra viên đạn trúng cạnh nào thì ta sẽ tính khoảng cách từ viên đạn đến các cạnh của xe tăng
                        // Cạnh bị trúng sẽ là cạnh có khoảng cách nhỏ nhất
                        const distanceToLeft = newBulletX - xMin; // Khoảng cách đến cạnh trái
                        const distanceToRight = xMax - newBulletX; // Khoảng cách đến cạnh phải
                        const distanceToTop = newBulletY - yMin; // Khoảng cách đến cạnh trên
                        const distanceToBottom = yMax - newBulletY; // Khoảng cách đến cạnh dưới

                        // Tìm khoảng cách nhỏ nhất
                        let minDistance = Math.min(distanceToLeft, distanceToRight, distanceToTop, distanceToBottom);

                        // Xử lý va chạm
                        if (minDistance === distanceToLeft || minDistance === distanceToRight) {
                            this.tanks[i].handleBulletCollision(j, true);
                        }
                        if (minDistance === distanceToTop || minDistance === distanceToBottom) {
                            this.tanks[i].handleBulletCollision(j, false);
                        }

                        // Nếu máu của xe tăng mục tiêu bằng 0 thì xóa xe tăng
                        if (this.tanks[indexTank].currentHealth <= 0) {
                            // this.tanks.splice(indexTank, 1);
                            this.tanks[indexTank].status = "destroyed";
                            const x = this.tanks[indexTank].x;
                            const y = this.tanks[indexTank].y;
                            try {
                                this.utilities.explode(x + 25, y + 25, this.ctx, this.tanks[indexTank].color);
                            } catch (e) {}
                        }
                    }
                }
            }
        }
    }

    drawMap() {
        /*
            Hàm vẽ map
            - Vẽ nhà chó và nhà mèo
            - Vẽ tường
        */
        if (this.map === null) {
            return;
        }
        this.ctx.fillStyle = this.map.homeDogColor;
        this.ctx.fillRect(this.map.sideDogX, this.map.sideDogY, this.map.homeSize, this.map.homeSize);

        this.ctx.fillStyle = this.map.homeCatColor;
        this.ctx.fillRect(this.map.sideCatX, this.map.sideCatY, this.map.homeSize, this.map.homeSize);

        this.ctx.fillStyle = "black";
        this.map.wallPositions.forEach((wall) => {
            this.ctx.fillRect(wall.x, wall.y, this.map.wallSize, this.map.wallSize);
        });
    }

    updateState() {
        /*
            Hàm cập nhật trạng thái game
            - Cập nhật vị trí của các viên đạn
            - Cập nhật vị trí của các xe tăng
            - Cập nhật vị trí của các vệt di chuyển
            - Xử lý va chạm trên xe tăng
            - Điều khiển bot
        */
        this.utilities.clearRect(this.ctx, 0, 0, this.canvas.width, this.canvas.height);

        this.drawMap();

        this.minimaxBOT();

        // Vẽ viên đạn
        this.tanks.forEach((tank) => {
            if (tank.status === "reborn") {
                tank.status = "protected";
                setTimeout(() => {
                    tank.status = "normal";
                }, 5000);
            }

            if (tank.status === "destroyed") {
                return;
            }
            this.utilities.drawBullets(this.ctx, tank);
        });

        // Vẽ vệt di chuyển
        this.tanks.forEach((tank) => {
            if (tank.status === "reborn") {
                tank.status = "protected";
                setTimeout(() => {
                    tank.status = "normal";
                }, 5000);
            }

            if (tank.status === "destroyed") {
                return;
            }
            this.utilities.drawTrail(this.ctx, tank);
        });

        // Vẽ xe tăng
        this.tanks.forEach((tank) => {
            if (tank.status === "reborn") {
                tank.status = "protected";
                setTimeout(() => {
                    tank.status = "normal";
                }, 5000);
            }

            if (tank.status === "destroyed") {
                return;
            }
            this.utilities.drawTank(this.ctx, tank);
        });

        // Vẽ nòng súng
        this.tanks.forEach((tank) => {
            if (tank.status === "reborn") {
                tank.status = "protected";
                setTimeout(() => {
                    tank.status = "normal";
                }, 5000);
            }

            if (tank.status === "destroyed") {
                return;
            }
            this.utilities.drawTankTurret(this.ctx, tank);
        });

        // Vẽ nòng súng
        this.tanks.forEach((tank) => {
            if (tank.status === "reborn") {
                tank.status = "protected";
                setTimeout(() => {
                    tank.status = "normal";
                }, 5000);
            }

            if (tank.status === "destroyed") {
                return;
            }
            this.utilities.drawProtectedTank(this.ctx, tank);
        });

        // Điều khiển bot
        this.controlBot();

        // Xử lý va chạm trên xe tăng
        this.detectAndHandleBulletCollision();
    }

    changeRotationTurret(idTank, cursorPos) {
        /*
            Hàm thay đổi góc quay của nòng súng của xe tăng
            - idTank: id của xe tăng
            - cursorPos: tọa độ của con trỏ chuột

            Hàm này dùng để thay đổi góc quay của nòng súng dựa vào tọa độ của con trỏ chuột
        */
        for (var i = 0; i < this.tanks.length; i++) {
            if (this.tanks[i].idTank === idTank) {
                var angle = this.utilities.calculusAngle(
                    {
                        x: this.tanks[i].x + 25,
                        y: this.tanks[i].y + 25,
                    },
                    cursorPos
                );
                this.tanks[i].rotationTurret = angle;
            }
        }
    }

    minimaxBOT() {
        /*
            Hàm minimaxBOT dùng để điều khiển bot
            - Hàm này sẽ xác định hành động tiếp theo của bot dựa vào thuật toán minimax
            - Hàm minimax sẽ trả về hành động tốt nhất cho bot
            - Hàm này sẽ thực hiện điều khiển xe tăng của bot dựa vào hành động trả về từ minimax
        */
        const depth = 5;
        if (Math.random() > 0.95) {
            this.possibleMoves = this.shuffleArray(["moveHead", "moveBack", "moveLeft", "moveRight"]);
        }
        for (var i = 0; i < this.tanks.length; i++) {
            if (this.tanks[i].idTank === "BO") {
                if (Math.random() > 0.95) {
                    this.controlTank(this.tanks[i].idTank, "aim", 0);
                }
                else{
                    const { bestMove, bestScore } = this.minimax(this.tanks, depth, true, -Infinity, Infinity, this.possibleMoves);
                    if (Math.random() > 0.99) console.log(bestMove, bestScore);
                    this.controlTank(this.tanks[i].idTank, bestMove, 0);
                }
            }
        }
    }

    simulateGame(stateGame, action, depth, tankId) {
        const game = new Game();
        game.setMap(this.map);
        stateGame.forEach((tank) => {
            game.addTank(tank.idTank, tank.x, tank.y, tank.idTeam);
            game.tanks[game.tanks.length - 1].setDeepState(tank);
            if (tank.idTank === "BO") {
                game.tanks[game.tanks.length - 1].idTank = "BOT";
            }
        });
        for (var i = 0; i < depth; i++) {
            game.controlTank(tankId, action, 0);
            game.detectAndHandleBulletCollision();
        }
        return game.tanks;
    }

    calculusScore(stateGame) {
        // console.log(stateGame);
        let score = 0;
        for (var i = 0; i < stateGame.length; i++) {
            if (stateGame[i].idTank === "BOT") {
                score += stateGame[i].currentHealth;
            } else {
                score -= stateGame[i].currentHealth;
            }
        }
        return score;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            // Chọn chỉ số ngẫu nhiên từ 0 đến i
            const j = Math.floor(Math.random() * (i + 1));

            // Hoán đổi phần tử tại i và j
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    minimax(stateGame, depth, isMaximizing, alpha, beta, possibleMoves) {
        if (depth === 0) {
            const score = this.calculusScore(stateGame);
            // if(Math.random() > 0.995) {
            //     console.log(score);
            //     console.log(stateGame);
            // }
            return { bestMove: null, bestScore: score };
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            let bestMove = null;
            for (let i = 0; i < possibleMoves.length; i++) {
                const newState = this.simulateGame(stateGame, possibleMoves[i], 50, "BOT");
                const newScore = this.minimax(newState, depth - 1, false, alpha, beta, possibleMoves).bestScore;
                if (newScore > bestScore) {
                    bestScore = newScore;
                    bestMove = possibleMoves[i];
                }
                alpha = Math.max(alpha, bestScore);
                if (beta <= alpha) {
                    break;
                }
            }
            return { bestMove, bestScore };
        } else {
            let bestScore = Infinity;
            let bestMove = null;
            const possibleMovesPlayer = ["moveHead"];
            for (let i = 0; i < possibleMovesPlayer.length; i++) {
                const newState = this.simulateGame(stateGame, possibleMovesPlayer[i], 50, "abcd1234");
                const newScore = this.minimax(newState, depth - 1, true, alpha, beta, possibleMoves).bestScore;
                if (newScore < bestScore) {
                    bestScore = newScore;
                    bestMove = possibleMovesPlayer[i];
                }
                beta = Math.min(beta, bestScore);
                if (beta <= alpha) {
                    break;
                }
            }
            return { bestMove, bestScore };
        }
    }
}

class Particle {
    constructor(x, y, radius, dx, dy, ctx, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dx = dx;
        this.dy = dy;
        this.alpha = 1;
        this.ctx = ctx;
        this.color = color;
    }
    draw() {
        this.ctx.save();
        this.ctx.globalAlpha = this.alpha;
        this.ctx.fillStyle = this.color;

        this.ctx.beginPath();

        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);

        this.ctx.fill();

        this.ctx.restore();
    }
    update() {
        this.draw();
        this.alpha -= 0.01;
        this.x += this.dx;
        this.y += this.dy;
    }
}
