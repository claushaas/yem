import { type TEmailTemplate } from '../../types/email-template.type.js';

export const welcomeEmailTemplate = (
	firstName: string,
	to: string,
	password: string,
): TEmailTemplate => ({
	html: `
  <!DOCTYPE html>
  <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
  
  <head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if !mso]><!--><!--<![endif]-->
    <style>
      * {
        box-sizing: border-box;
      }
  
      body {
        margin: 0;
        padding: 0;
      }
  
      a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: inherit !important;
      }
  
      #MessageViewBody a {
        color: inherit;
        text-decoration: none;
      }
  
      p {
        line-height: inherit
      }
  
      .desktop_hide,
      .desktop_hide table {
        mso-hide: all;
        display: none;
        max-height: 0px;
        overflow: hidden;
      }
  
      .image_block img+div {
        display: none;
      }
  
      @media (max-width:620px) {
        .desktop_hide table.icons-inner {
          display: inline-block !important;
        }
  
        .icons-inner {
          text-align: center;
        }
  
        .icons-inner td {
          margin: 0 auto;
        }
  
        .mobile_hide {
          display: none;
        }
  
        .row-content {
          width: 100% !important;
        }
  
        .stack .column {
          width: 100%;
          display: block;
        }
  
        .mobile_hide {
          min-height: 0;
          max-height: 0;
          max-width: 0;
          overflow: hidden;
          font-size: 0px;
        }
  
        .desktop_hide,
        .desktop_hide table {
          display: table !important;
          max-height: none !important;
        }
      }
    </style>
  </head>
  
  <body style="background-color: #ffffff; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
    <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
      <tbody>
        <tr>
          <td>
            <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
              <tbody>
                <tr>
                  <td>
                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px; margin: 0 auto;" width="600">
                      <tbody>
                        <tr>
                          <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                            <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                              <tr>
                                <td class="pad" style="width:100%;">
                                  <div class="alignment" align="center" style="line-height:10px">
                                    <div style="max-width: 219px;"><a href="https://yogaemmovimento.com" target="_blank" style="outline:none" tabindex="-1"><img src="https://img.amo.yoga/logo_yem.png" style="display: block; height: auto; border: 0; width: 100%;" width="219" alt="Yoga em Movimento" title="Yoga em Movimento"></a></div>
                                  </div>
                                </td>
                              </tr>
                            </table>
                            <table class="divider_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                              <tr>
                                <td class="pad" style="padding-bottom:10px;padding-left:10px;padding-right:10px;padding-top:30px;">
                                  <div class="alignment" align="center">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                      <tr>
                                        <td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 1px solid #dddddd;"><span>&#8202;</span></td>
                                      </tr>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            </table>
                            <table class="heading_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                              <tr>
                                <td class="pad" style="padding-bottom:10px;padding-left:10px;padding-right:10px;padding-top:30px;text-align:center;width:100%;">
                                  <h1 style="margin: 0; color: #7747FF; direction: ltr; font-family: Arial, Helvetica, sans-serif; font-size: 38px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 45.6px;"><span class="tinyMce-placeholder">Seu acesso chegou!</span></h1>
                                </td>
                              </tr>
                            </table>
                            <table class="paragraph_block block-4" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                              <tr>
                                <td class="pad">
                                  <div style="color:#101112;direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                    <p style="margin: 0; margin-bottom: 16px;">Olá, ${firstName}, estou aqui para te dar as boas vindas a Yoga em Movimento.</p>
                                    <p style="margin: 0; margin-bottom: 16px;">Abaixo estão os dados para acessar a área dos alunos:</p>
                                    <p style="margin: 0; margin-bottom: 16px;">Link: <a href="https://yogaemmovimento.com" target="_blank" title="Área dos Alunos" style="text-decoration: underline; color: #7747FF;" rel="noopener">https://yogaemmovimento.com</a></p>
                                    <p style="margin: 0; margin-bottom: 16px;">Usuário: ${to}</p>
                                    <p style="margin: 0; margin-bottom: 16px;">Senha: ${password}</p>
                                    <p style="margin: 0; margin-bottom: 16px;">Espero que este seja o primeiro passo de uma vida com mais propósito, saúde e autoconhecimento.</p>
                                    <p style="margin: 0; margin-bottom: 16px;">Conte conosco nessa jornada!</p>
                                    <p style="margin: 0; margin-bottom: 16px;">Caso precise de qualquer ajuda, não hesite em nos chamar no WhatsApp: <a href="https://wa.me/551149359150" target="_blank" title="WhatsApp da Yoga em Movimento" style="text-decoration: underline; color: #7747FF;" rel="noopener">+55 11 4935-9150</a></p>
                                    <p style="margin: 0; margin-bottom: 16px;">Um forte abraço,</p>
                                    <p style="margin: 0; margin-bottom: 16px;">Claus Haas</p>
                                    <p style="margin: 0;">Diretor da Yoga em Movimento</p>
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table><!-- End -->
  </body>
  
  </html>
  `,
	subject: `${firstName}, seu acesso chegou!`,
	text: `
  Olá, ${firstName}, estou aqui para te dar as boas vindas a Yoga em Movimento.

  Abaixo estão os dados para acessar a área dos alunos:

  Link: https://yogaemmovimento.com
  Usuário: ${to}
  Senha: ${password}

  Espero que este seja o primeiro passo de uma vida com mais propósito, saúde e autoconhecimento.

  Conte conosco nessa jornada!

  Caso precise de qualquer ajuda, não hesite em nos chamar no WhatsApp: +55 11 4935-9150

  Um forte abraço,
  Claus Haas
  Diretor da Yoga em Movimento
  `,
	to,
});
