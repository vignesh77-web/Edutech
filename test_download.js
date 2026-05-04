const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'server/.env' });

async function test() {
    await mongoose.connect(process.env.MONGODB_URL);
    const User = require('./server/models/User');
    const SubSection = require('./server/models/SubSection');
    
    // get a student
    const student = await User.findOne({ accountType: 'Student' });
    if (!student) { console.log('no student'); return; }
    
    const token = jwt.sign(
        { email: student.email, id: student._id, accountType: student.accountType },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
    
    // get a resource containing sub array greater than 0
    let sub;
    const subs = await SubSection.find({});
    for (let s of subs) {
        if (s.resources && s.resources.length > 0) {
            sub = s; break;
        }
    }
    
    if (!sub || !sub.resources || !sub.resources[0]) {
        console.log('no resource found');
        return;
    }
    const fileUrl = sub.resources[0].fileUrl;
    console.log('Testing with url:', fileUrl);
    
    const apiUrl = 'http://localhost:4000/api/v1/course/download-resource?url=' + encodeURIComponent(fileUrl) + '&token=' + encodeURIComponent(token) + '&filename=test.pdf';
    
    console.log('Requesting proxy URL...');
    const http = require('http');
    http.get(apiUrl, (res) => {
        console.log('STATUS:', res.statusCode);
        console.log('HEADERS:', res.headers);
        
        let dataLen = 0;
        res.on('data', d => { dataLen += d.length; });
        res.on('end', () => console.log('DOWNLOAD OK! Bytes:', dataLen));
    }).on('error', e => console.error(e));
}

test().catch(console.error);
