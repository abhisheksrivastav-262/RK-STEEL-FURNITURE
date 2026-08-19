const fs = require('fs');
const path = require('path');
const db = require('./models');

async function sync() {
    await db.sequelize.sync();
    const dir = path.join(__dirname, 'public/assets');
    const files = fs.readdirSync(dir);
    for(const f of files) {
        if(f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')) {
            const exists = await db.Media.findOne({ where: { filename: f }});
            if(!exists) {
                await db.Media.create({
                    filename: f,
                    path: `/assets/${f}`,
                    mimetype: 'image/png',
                    size: fs.statSync(path.join(dir, f)).size
                });
            }
        }
    }
    console.log('Media Synced!');
    process.exit();
}
sync();
