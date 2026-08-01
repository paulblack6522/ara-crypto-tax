<?xml version="1.0" encoding="UTF-8"?>
<!--
  sitemap.xsl for Ara Tax Services LLC
  Renders sitemap.xml as a readable table when a person opens it in a
  browser. Crawlers ignore this stylesheet and read the XML directly.
  All styling is inline on purpose: this file must make no external
  request, exactly like the rest of the site.
-->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">

  <xsl:output method="html" encoding="UTF-8" indent="yes"
    doctype-system="about:legacy-compat"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>XML sitemap | Ara Tax Services LLC</title>
        <meta name="robots" content="noindex"/>
        <style>
          :root {
            --c-brand: #1a4480;
            --c-brand-dark: #162e51;
            --c-ink: #1b1b1b;
            --c-base-darker: #3d4551;
            --c-base-light: #a9aeb1;
            --c-base-lighter: #dfe1e2;
            --c-base-lightest: #f0f0f0;
            --c-white: #ffffff;
            --c-focus: #2491ff;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: var(--c-white);
            color: var(--c-ink);
            font-family: "Source Sans 3", "Public Sans", -apple-system,
              BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
              Arial, sans-serif;
            font-size: 17px;
            line-height: 1.55;
          }
          a { color: var(--c-brand); text-decoration: underline; }
          a:visited { color: #54278f; }
          a:hover { color: var(--c-brand-dark); }
          a:focus, th a:focus {
            outline: 0.25rem solid var(--c-focus);
            outline-offset: 0;
          }
          .wrap { max-width: 64rem; margin: 0 auto; padding: 0 1rem; }
          header.top {
            background: var(--c-brand-dark);
            color: var(--c-white);
            padding: 1.5rem 0;
            border-bottom: 4px solid var(--c-brand);
          }
          header.top p { margin: 0.25rem 0 0; color: var(--c-base-lighter); }
          h1 { margin: 0; font-size: 1.75rem; line-height: 1.2; }
          h2 { font-size: 1.375rem; margin: 2rem 0 0.5rem; }
          main { padding: 2rem 0 1rem; }
          .count {
            display: inline-block;
            background: var(--c-base-lightest);
            border-left: 4px solid var(--c-brand);
            padding: 0.5rem 0.75rem;
            margin: 0 0 1.5rem;
          }
          .tablewrap { overflow-x: auto; }
          table {
            border-collapse: collapse;
            width: 100%;
            min-width: 34rem;
            font-size: 1rem;
          }
          caption {
            text-align: left;
            font-weight: 700;
            padding-bottom: 0.5rem;
          }
          th, td {
            border: 1px solid var(--c-base-light);
            padding: 0.5rem 0.75rem;
            text-align: left;
            vertical-align: top;
          }
          thead th {
            background: var(--c-brand-dark);
            color: var(--c-white);
            font-weight: 700;
          }
          tbody tr:nth-child(even) td { background: var(--c-base-lightest); }
          td.num { white-space: nowrap; }
          footer.legal {
            margin-top: 2.5rem;
            background: var(--c-brand-dark);
            color: var(--c-white);
            padding: 1.5rem 0;
          }
          footer.legal p {
            font-size: 15px;
            line-height: 1.5;
            margin: 0 0 0.75rem;
            color: var(--c-white);
          }
          footer.legal p:last-child { margin-bottom: 0; }
          footer.legal a { color: var(--c-base-lighter); }
          footer.legal a:hover { color: var(--c-white); }
        </style>
      </head>
      <body>

        <header class="top">
          <div class="wrap">
            <h1>XML sitemap</h1>
            <p>Ara Tax Services LLC, San Ramon, California</p>
          </div>
        </header>

        <main>
          <div class="wrap">

            <p class="count">
              This sitemap lists
              <strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></strong>
              pages. It is a file for search engines. If you arrived here by
              accident, the
              <a href="index.html">home page</a> is the place to start.
            </p>

            <div class="tablewrap">
              <table>
                <caption>Pages published on this site</caption>
                <thead>
                  <tr>
                    <th scope="col">Page address</th>
                    <th scope="col">Last modified</th>
                    <th scope="col">Change frequency</th>
                    <th scope="col">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sitemap:urlset/sitemap:url">
                    <tr>
                      <td>
                        <a>
                          <xsl:attribute name="href">
                            <xsl:value-of select="sitemap:loc"/>
                          </xsl:attribute>
                          <xsl:value-of select="sitemap:loc"/>
                        </a>
                      </td>
                      <td class="num"><xsl:value-of select="sitemap:lastmod"/></td>
                      <td><xsl:value-of select="sitemap:changefreq"/></td>
                      <td class="num"><xsl:value-of select="sitemap:priority"/></td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </div>

          </div>
        </main>

        <footer class="legal">
          <div class="wrap">
            <p>Ara Tax Services LLC is a private tax preparation firm. We are not the IRS. We are not affiliated with, endorsed by, or acting on behalf of the Internal Revenue Service, the U.S. Department of the Treasury, or any government agency.</p>
            <p>You can file your own federal tax return directly with the IRS at no cost to you, including through IRS Free File if you are eligible. Our service is a paid, optional alternative in which we prepare your return for you.</p>
          </div>
        </footer>

      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
