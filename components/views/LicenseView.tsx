'use client';

import React, { useEffect, useState } from 'react';
import { fetchSiteConfig, SiteConfig } from '@/lib/api';

const LICENSE_INFO: Record<string, { name: string; description: string }> = {
  'CC-BY-4.0': {
    name: 'Creative Commons Attribution 4.0',
    description: '允许任何用途的分享和改编，但必须注明原作者。'
  },
  'CC-BY-SA-4.0': {
    name: 'Creative Commons Attribution-ShareAlike 4.0',
    description: '允许分享和改编，必须注明原作者，且衍生作品须使用相同协议。'
  },
  'CC-BY-NC-4.0': {
    name: 'Creative Commons Attribution-NonCommercial 4.0',
    description: '允许非商业用途的分享和改编，必须注明原作者。'
  },
  'CC-BY-NC-SA-4.0': {
    name: 'Creative Commons Attribution-NonCommercial-ShareAlike 4.0',
    description: '允许非商业用途的分享和改编，必须注明原作者，且衍生作品须使用相同协议。'
  },
  'CC-BY-NC-ND-4.0': {
    name: 'Creative Commons Attribution-NonCommercial-NoDerivatives 4.0',
    description: '允许非商业用途的分享，必须注明原作者，不允许改编。'
  },
  'CC-BY-ND-4.0': {
    name: 'Creative Commons Attribution-NoDerivatives 4.0',
    description: '允许分享，必须注明原作者，不允许改编。'
  },
  'CC0-1.0': {
    name: 'CC0 1.0 Universal (Public Domain)',
    description: '放弃所有版权，作品进入公有领域。'
  },
  'MIT': {
    name: 'MIT License',
    description: '允许任何用途，几乎无限制。'
  },
  'All Rights Reserved': {
    name: '保留所有权利',
    description: '未经授权不得转载、复制或使用本站内容。'
  },
};

export default function LicenseView() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSiteConfig()
      .then(setConfig)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 24, fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}>
        Loading...
      </div>
    );
  }

  const license = config?.siteLicense || '';
  const licenseUrl = config?.siteLicenseUrl || '';
  const siteTitle = config?.siteTitle || 'Y2K Pixel Blog';
  const knownLicense = LICENSE_INFO[license];

  return (
    <div style={{
      padding: 24,
      fontFamily: 'var(--font-sans)',
      color: 'var(--text-primary)',
      lineHeight: 1.8,
      maxWidth: 560,
      margin: '0 auto'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottom: '2px dashed var(--border)'
      }}>
        <span className="font-pixel" style={{
          fontSize: 14,
          color: 'var(--accent-purple)',
          display: 'block',
          marginBottom: 8
        }}>
          LICENSE
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {siteTitle}
        </span>
      </div>

      {!license ? (
        <div style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          padding: '32px 0'
        }}>
          站点管理员尚未设置内容协议。
        </div>
      ) : (
        <div>
          <div style={{
            background: 'var(--bg-tertiary)',
            border: '2px solid var(--border)',
            padding: 16,
            marginBottom: 16,
            boxShadow: '2px 2px 0 var(--glow-purple)'
          }}>
            <div style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--accent-pink)',
              marginBottom: 8
            }}>
              {knownLicense ? knownLicense.name : license}
            </div>
            {knownLicense && (
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {knownLicense.description}
              </div>
            )}
          </div>

          {licenseUrl && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <a
                href={licenseUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--accent-purple)',
                  fontSize: 13,
                  textDecoration: 'underline',
                  textUnderlineOffset: 3
                }}
              >
                查看协议全文 &rarr;
              </a>
            </div>
          )}

          <div style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            textAlign: 'center',
            borderTop: '1px solid var(--border)',
            paddingTop: 16
          }}>
            本站所有原创内容均按上述协议发布，除非另有说明。
          </div>
        </div>
      )}
    </div>
  );
}
