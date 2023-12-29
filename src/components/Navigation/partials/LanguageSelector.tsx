import { languageList } from 'utils/i18n';
import ReactGA from 'react-ga-neo';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

import { useSettings } from 'hooks/useSettings';

import './LanguageSelector.scss';

export default function LanguageSelector({ className = '' }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const { updateSettings } = useSettings();
  const currentLanguage = i18n.language;

  function changeLanguage(el) {
    const lang = el.target.dataset.lang;
    ReactGA.event({
      category: 'Language',
      action: 'Change',
      label: lang,
    });
    updateSettings({
      lang,
    });
  }

  return (
    <UncontrolledDropdown data-cy="LanguageSelector" className={`ows-LanguageSelector ${className}`} nav>
      <DropdownToggle title="Select language" nav caret>
        <FontAwesomeIcon icon={faGlobe} />
        <span className="d-none d-lg-inline">{t('language')}</span>
      </DropdownToggle>
      <DropdownMenu end>
        {languageList.map((lang) => (
          <DropdownItem
            key={lang.code}
            active={lang.code === currentLanguage}
            data-lang={lang.code}
            onClick={changeLanguage}
          >
            {lang.name}
          </DropdownItem>
        ))}
        <a
          className="px-2 d-none d-sm-block text-center ows-translateCTA"
          href={process.env.REACT_APP_LINK_TO_TRANSLATIONS}
        >
          {t('translateYourLanguage')}
        </a>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
}
