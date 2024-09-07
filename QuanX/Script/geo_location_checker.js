if ($response.statusCode !== 200) {
  $done(null);
}

const emojis = ['🆘', '🈲', '⚠️', '🔞', '📵', '🚦', '🏖', '🖥', '📺', '🐧', '🐬', '🦉', '🍄', '⛳️', '🚴', '🤑', '👽', '🤖', '🎃', '👺', '👁', '🐶', '🐼', '🐌', '👥'];

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function ValidCheck(para) {
  return para ? para : emojis[getRandomInt(emojis.length)];
}

// 定义flag映射
const flags = new Map([
  ["AC", "🇦🇨"], ["AE", "🇦🇪"], ["AF", "🇦🇫"], ["AI", "🇦🇮"], ["AL", "🇦🇱"], ["AM", "🇦🇲"], ["AQ", "🇦🇶"], ["AR", "🇦🇷"], ["AS", "🇦🇸"], ["AT", "🇦🇹"], ["AU", "🇦🇺"], ["AW", "🇦🇼"], ["AX", "🇦🇽"], ["AZ", "🇦🇿"], ["BA", "🇧🇦"], ["BB", "🇧🇧"], ["BD", "🇧🇩"], ["BE", "🇧🇪"], ["BF", "🇧🇫"], ["BG", "🇧🇬"], 
  ["BH", "🇧🇭"], ["BI", "🇧🇮"], ["BJ", "🇧🇯"], ["BM", "🇧🇲"], ["BN", "🇧🇳"], ["BO", "🇧🇴"], ["BR", "🇧🇷"], ["BS", "🇧🇸"], ["BT", "🇧🇹"], ["BV", "🇧🇻"], ["BW", "🇧🇼"], ["BY", "🇧🇾"], ["BZ", "🇧🇿"], ["CA", "🇨🇦"], ["CF", "🇨🇫"], ["CH", "🇨🇭"], ["CK", "🇨🇰"], ["CL", "🇨🇱"], ["CM", "🇨🇲"], ["CN", "🇨🇳"], ["CO", "🇨🇴"], ["CP", "🇨🇵"], ["CR", "🇨🇷"], ["CU", "🇨🇺"], ["CV", "🇨🇻"], ["CW", "🇨🇼"], ["CX", "🇨🇽"], ["CY", "🇨🇾"], ["CZ", "🇨🇿"], ["DE", "🇩🇪"], ["DG", "🇩🇬"], ["DJ", "🇩🇯"], ["DK", "🇩🇰"], ["DM", "🇩🇲"], ["DO", "🇩🇴"], ["DZ", "🇩🇿"], ["EA", "🇪🇦"], ["EC", "🇪🇨"], ["EE", "🇪🇪"], ["EG", "🇪🇬"], ["EH", "🇪🇭"], ["ER", "🇪🇷"], ["ES", "🇪🇸"], ["ET", "🇪🇹"], ["EU", "🇪🇺"], ["FI", "🇫🇮"], ["FJ", "🇫🇯"], ["FK", "🇫🇰"], ["FM", "🇫🇲"], ["FO", "🇫🇴"], ["FR", "🇫🇷"], ["GA", "🇬🇦"], ["GB", "🇬🇧"], ["HK", "🇭🇰"], ["HU", "🇭🇺"], ["ID", "🇮🇩"], ["IE", "🇮🇪"], ["IL", "🇮🇱"], ["IM", "🇮🇲"], ["IN", "🇮🇳"], ["IS", "🇮🇸"], ["IT", "🇮🇹"], ["JP", "🇯🇵"], ["KR", "🇰🇷"], ["LU", "🇱🇺"], ["MO", "🇲🇴"], ["MX", "🇲🇽"], ["MY", "🇲🇾"], ["NL", "🇳🇱"], ["PH", "🇵🇭"], ["RO", "🇷🇴"], ["RS", "🇷🇸"], ["RU", "🇷🇺"], ["RW", "🇷🇼"], ["SA", "🇸🇦"], ["SB", "🇸🇧"], ["SC", "🇸🇨"], ["SD", "🇸🇩"], ["SE", "🇸🇪"], ["SG", "🇸🇬"], ["TH", "🇹🇭"], ["TN", "🇹🇳"], ["TO", "🇹🇴"], ["TR", "🇹🇷"], ["TV", "🇹🇻"], ["TW", "🇹🇼"], ["UK", "🇬🇧"], ["UM", "🇺🇲"], ["US", "🇺🇸"], ["UY", "🇺🇾"], ["UZ", "🇺🇿"], ["VA", "🇻🇦"], ["VE", "🇻🇪"], ["VG", "🇻🇬"], ["VI", "🇻🇮"], ["VN", "🇻🇳"], ["ZA", "🇿🇦"], ["BG", "🇧🇬"]
]);

// 若不存在对应flag则使用"🏳️‍🌈"
function getFlag(countryCode) {
  return flags.get(countryCode) || '🏳️‍🌈';
}

var body = $response.body;
var obj = JSON.parse(body);
var countryFlag = flags.get(obj['countryCode']) || '';

/** 
// 修改title的逻辑
var title;
if (!obj['city'] || obj['city'] === obj['country']) {
  title = `${countryFlag} ${obj['country']}`;
} else {
  var region = obj['region'] ? `, ${obj['region']}` : '';
  title = `${countryFlag} ${ValidCheck(obj['city'])}${region}`;
}
*/

function removeCity(name) {
    return name.replace(/\s*city\s*/i, '').trim();
}

var title;
var countryFlag = flags.get(obj['countryCode']) || '';
var cityName = obj['city'] ? removeCity(obj['city']) : '';

// 处理美国的特殊情况
if (obj['countryCode'] === 'US') {
    if (obj['region'] && obj['regionName']) {
        // 随机选择格式
        if (Math.random() < 0.5) {
            title = `${countryFlag} ${cityName}, ${obj['region']}, ${obj['countryCode']}`;
        } else {
            title = `${countryFlag} ${cityName}-(${obj['region']}), ${obj['countryCode']}`;
        }
    } else {
        // 如果没有 region 或 regionName，仅使用 cityName 和 countryCode
        title = `${countryFlag} ${cityName}, ${obj['countryCode']}`;
    }
} else {
    // 对于其他国家，使用固定格式
    title = `${countryFlag} ${cityName}, ${obj['countryCode']}`;
}

/**
// 修改subtitle的逻辑
var asNumber = obj['as'].split(' ')[0].slice(2); // 提取AS号码，去掉"AS"前缀
var asName = obj['asname']; // 使用asname字段
var subtitle = `${emojis[getRandomInt(emojis.length)]} AS${asNumber} · ${asName}`;
*/
// 定义固定的Unicode符号数组
const fixedSymbols = ['', '★', '✧', '✿', '❂'];

// 获取随机固定符号
function getRandomFixedSymbol() {
  return fixedSymbols[getRandomInt(fixedSymbols.length)];
}

// 获取随机表情符号
function getRandomEmoji() {
  return emojis[getRandomInt(emojis.length)];
}

// 生成 subtitle 的逻辑
var asNumber = obj['as'].split(' ')[0].slice(2); // 提取AS号码，去掉"AS"前缀
var asName = obj['asname']; // 使用asname字段
var randomFixedSymbol1 = getRandomFixedSymbol();
var randomFixedSymbol2 = getRandomFixedSymbol();

// 随机选择生成 subtitle 的方式
if (Math.random() < 0.5) {
  var subtitle = `${getRandomEmoji()} AS${asNumber} · ${asName}`;
} else {
  var subtitle = `${randomFixedSymbol1}AS${asNumber}-(${asName})${randomFixedSymbol2}`;
}
// 修改description的逻辑
var description = `IP: ${obj['query']}
GEO: ${ValidCheck(obj['city'])}, ${ValidCheck(obj['regionName'])}, ${obj['country']}
ASN: ${obj['as']}
ORG: ${obj['org']}`;

$done({ title, subtitle, ip: obj['query'], description });
