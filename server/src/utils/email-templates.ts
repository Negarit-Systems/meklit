const ORGANIZATION_NAME = 'Meklit.Life';
const LOGO_URL = 'https://i.postimg.cc/XqXPxxNM/Screenshot-from-2025-09-11-01-39-35.png';
const SECONDARY_LOGO = 'https://i.postimg.cc/25wXDgVR/Screenshot-from-2025-09-11-01-46-57.png';
const ADDRESS = 'Addis Ababa, Ethiopia';
const SUPPORT_EMAIL = 'negarit.system.tech@gmail.com';
const FACEBOOK_URL = 'https://facebook.com';
const YOUTUBE_URL = 'https://youtube.com';
const TWITTER_URL = 'https://x.com';

const FACEBOOK_ICON_URL =
  'https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661502815169_682499/email-template-icon-facebook';
const TWITTER_ICON_URL =
  'https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503043040_372004/email-template-icon-twitter';
const YOUTUBE_ICON_URL =
  'https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503195931_210869/email-template-icon-youtube';

export const otpTemplate = (fullName: string, key: string, duration: number) => {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <title>OTP Template</title>
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
    </head>
    <body
      style="
        margin: 0;
        font-family: 'Poppins', sans-serif;
        background: #ffffff;
        font-size: 14px;
      "
    >
      <header>
        <table style="width: 100%;">
          <tbody>
            <tr style="height: 0;">
              <td></td>
              <td style="text-align: right;">
                <span
                  style="font-size: 16px; line-height: 30px; color: #ffffff;"
                >2025</span>
              </td>
            </tr>
          </tbody>
        </table>
      </header>

      <main>
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="padding: 30px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-right: 15px; vertical-align: middle;">
                    <img src=${LOGO_URL} width="100" height="100" alt="Logo" style="display: block;">
                  </td>
                  <td style="vertical-align: middle;">
                    <p style="font-size: 24px; font-weight: bold; margin: 0; line-height: 1.3;">
                      ${ORGANIZATION_NAME}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <div
          style="
            padding: 52px 30px 115px;
            background: #ffffff;
            border-top: 1px solid #e6ebf1;
            text-align: center;
            max-width: 489px;
            width: 100%;
            margin: 0 auto;
          "
        >
          <div style="width: 100%; max-width: 489px; margin: 0 auto;">
            <p
              style="
                margin: 0;
                margin-top: 5px;
                font-size: 16px;
                font-weight: 500;
              "
            >
              Hey ${fullName},
            </p>
            <p
              style="
                margin: 0;
                margin-top: 17px;
                font-weight: 500;
                letter-spacing: 0.56px;
              "
            >
              Use the following OTP to complete the procedure to verify your email address.
              OTP is valid for
              <span style="font-weight: 600; color: #1f1f1f;">${duration} minutes</span>.
              Do not share this code with others.
            </p>
            <p
              style="
                margin: 0;
                margin-top: 17px;
                font-size: 24px;
                font-weight: 500;
                color: #1f1f1f;
              "
            >
              Your OTP
            </p>
            <p
              style="
                font-size: 40px;
                font-weight: 600;
                letter-spacing: 25px;
                color: #fafafa;
                background-color: #0d7801;
                padding: 10px 0;
              "
            >
              ${key}
            </p>
          </div>
        </div>

        <p
          style="
            max-width: 400px;
            margin: 0 auto;
            text-align: center;
            font-weight: 500;
            color: #8c8c8c;
          "
        >
          Need help? Ask at
          <a href="mailto:{{SUPPORT_EMAIL}}" style="color: #499fb6; text-decoration: none;">
            ${SUPPORT_EMAIL}
          </a>
          or visit our
          <a href="{{HELP_CENTER_URL}}" target="_blank" style="color: #499fb6; text-decoration: none;">
            Help Center
          </a>
        </p>
      </main>

      <footer
        style="
          width: 100%;
          max-width: 490px;
          margin: 20px auto 0;
          padding-top: 20px;
          text-align: center;
          border-top: 1px solid #e6ebf1;
        "
      >
        <img
            alt="Secondary-Logo"
            width="500px"
            height="60px"
            src=${SECONDARY_LOGO}
        />

        <p style="margin: 0; margin-top: 4px; color: #434343;">
          ${ADDRESS}
        </p>
        <div style="margin: 0; margin-top: 16px;">
          <a href="${FACEBOOK_URL}" target="_blank" style="display: inline-block;">
            <img width="36px" alt="Facebook" src="${FACEBOOK_ICON_URL}" />
          </a>
          <a href="${TWITTER_URL}" target="_blank" style="display: inline-block; margin-left: 8px;">
            <img width="36px" alt="Twitter" src="${TWITTER_ICON_URL}" />
          </a>
          <a href="${YOUTUBE_URL}" target="_blank" style="display: inline-block; margin-left: 8px;">
            <img width="36px" alt="YouTube" src="${YOUTUBE_ICON_URL}" />
          </a>
        </div>
        <p style="margin: 0; margin-top: 16px; color: #434343;">
          Copyright © 2025 ${ORGANIZATION_NAME}. All rights reserved.
        </p>
      </footer>
    </body>
  </html>`;
};
