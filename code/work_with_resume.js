let https = require('https');

const hh_host = 'api.hh.ru';
const hh_port = 443;
let resume_id = Array();

function resume_update_function(token) {
    const get_resume_headres = {
        'Authorization': 'Bearer ' + token,
        'User-Agent': 'My_app',
    };
    var options_get_resumes = {
        host: hh_host,
        port: hh_port,
        path: '/resumes/mine',
        method: 'GET',
        headers: get_resume_headres,
    };
    var req_get_resumes = https.request(options_get_resumes, function (res) {
        if (res.statusCode != 200) {
            console.log("Ошибка получения информации по резюме");
            return;
        }
        let body = '';
        res.on('data', function (d) {
            body += d;
        });

        res.on('end', function () {
            body = JSON.parse(body);

            for (var item in body.items) {
                resume_id.push(body.items[item].id);
            }
            make_resume_updates(token);
        });

    });
    req_get_resumes.end();
    req_get_resumes.on('error', e => { console.error(e); return; });

}


function make_resume_updates(token) {

    resume_id.forEach(function (element) {
        make_resume_update(token, element)
    }, this);

}

function make_resume_update(token, id) {


    const post_resume_headres = {
        'Authorization': 'Bearer ' + token,
        'User-Agent': 'My_app',
    };

    var options_post_resumes = {
        host: hh_host,
        port: hh_port,
        path: `/resumes/${id}/publish`,
        method: 'POST',
        headers: post_resume_headres,
    };

    var req_post_resumes = https.request(options_post_resumes, function (res) {

        switch (res.statusCode) {
            case 204:
                console.log(`Резюме ${id} успешно обновлено.`);
                break;
            case 429:
                console.log(`Для резюме ${id} обновление ещё недоступно.`);
                break;
            case 400:
                console.log(`Для резюме ${id} публикация или продление невозможны.`);
                break;
            case 403:
                console.log(`Для резюме ${id} операция публикации недоступна из-за отсутствия прав.`);
                break;
            default:
                console.log(`Для резюме ${id} статус ответа = ${res.statusCode}.`);
        }

    });

    req_post_resumes.end();
    req_post_resumes.on('error', e => { console.error(e); return; });
}

exports.resume_update = resume_update_function;