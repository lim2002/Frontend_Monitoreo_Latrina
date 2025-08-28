export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
  isPro?: boolean;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: any;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: any;
  isPro?: boolean;
}

import { uniqueId } from 'lodash';

const SidebarContent: MenuItem[] = [
  {
    heading: 'Home',
    children: [
      {
        name: 'Dashboard',
        icon: 'solar:widget-add-line-duotone',
        id: uniqueId(),
        url: '/',
        isPro: false,
      },
      {
        name: 'Dashboard 1',
        icon: 'solar:screencast-2-line-duotone',
        id: uniqueId(),
        url: 'https://spike-react-tailwind-main.netlify.app/',
        isPro: true,
      },
      {
        name: 'Dashboard 2',
        icon: 'solar:chart-line-duotone',
        id: uniqueId(),
        url: 'https://spike-react-tailwind-main.netlify.app/dashboards/dashboard2',
        isPro: true,
      },

      {
        name: 'Front Pages',
        id: uniqueId(),
        icon: 'solar:home-angle-linear',
        children: [
          {
            name: 'Homepage',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/frontend-pages/homepage',
            isPro: true,
          },
          {
            name: 'About Us',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/frontend-pages/aboutus',
            isPro: true,
          },
          {
            name: 'Blog',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/frontend-pages/blog',
            isPro: true,
          },
          {
            name: 'Blog Details',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/frontend-pages/blog/detail/streaming-video-way-before-it-was-cool-go-dark-tomorrow',
            isPro: true,
          },
          {
            name: 'Contact Us',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/frontend-pages/contact',
            isPro: true,
          },
          {
            name: 'Portfolio',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/frontend-pages/portfolio',
            isPro: true,
          },
          {
            name: 'Pricing',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/frontend-pages/pricing',
            isPro: true,
          },
        ],
      },
    ],
  },
  {
    heading: 'Utilities',
    children: [
      {
        name: 'Buttons',
        icon: 'solar:palette-round-line-duotone',
        id: uniqueId(),
        url: '/ui/buttons',
        isPro: false,
      },
      {
        name: 'Typography',
        icon: 'solar:text-circle-outline',
        id: uniqueId(),
        url: '/ui/typography',
        isPro: false,
      },
      {
        name: 'Table',
        icon: 'solar:bedside-table-3-linear',
        id: uniqueId(),
        url: '/ui/table',
        isPro: false,
      },
      {
        name: 'Form',
        icon: 'solar:password-minimalistic-outline',
        id: uniqueId(),
        url: '/ui/form',
        isPro: false,
      },
      {
        name: 'Alert',
        icon: 'solar:airbuds-case-charge-outline',
        id: uniqueId(),
        url: '/ui/alert',
        isPro: false,
      },
    ],
  },
  {
    heading: 'Apps',
    children: [
      {
        id: uniqueId(),
        name: 'Contacts',
        icon: 'solar:phone-line-duotone',
        url: 'https://spike-react-tailwind-main.netlify.app/apps/contacts',
        isPro: true,
      },
      {
        id: uniqueId(),
        name: 'Chats',
        icon: 'solar:chat-round-line-line-duotone',
        url: 'https://spike-react-tailwind-main.netlify.app/apps/chats',
        isPro: true,
      },
      {
        id: uniqueId(),
        name: 'Calendar',
        icon: 'solar:calendar-mark-line-duotone',
        url: 'https://spike-react-tailwind-main.netlify.app/apps/calendar',
        isPro: true,
      },
      {
        id: uniqueId(),
        name: 'Email',
        icon: 'solar:letter-linear',
        url: 'https://spike-react-tailwind-main.netlify.app/apps/email',
        isPro: true,
      },
      {
        id: uniqueId(),
        name: 'Tickets',
        icon: 'solar:ticker-star-outline',
        url: 'https://spike-react-tailwind-main.netlify.app/apps/tickets',
        isPro: true,
      },
      {
        id: uniqueId(),
        name: 'Kanban',
        icon: 'solar:notebook-linear',
        url: 'https://spike-react-tailwind-main.netlify.app/apps/kanban',
        isPro: true,
      },
      {
        id: uniqueId(),
        name: 'Notes',
        icon: 'solar:document-text-outline',
        url: 'https://spike-react-tailwind-main.netlify.app/apps/notes',
        isPro: true,
      },
      {
        name: 'User Profile V1',
        id: uniqueId(),
        icon: 'solar:shield-user-outline',
        children: [
          {
            id: uniqueId(),
            name: 'Profile',
            url: 'https://spike-react-tailwind-main.netlify.app/apps/user-profile/profile',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Followers',
            url: 'https://spike-react-tailwind-main.netlify.app/apps/user-profile/followers',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Friends',
            url: 'https://spike-react-tailwind-main.netlify.app/apps/user-profile/friends',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Gallery',
            url: 'https://spike-react-tailwind-main.netlify.app/apps/user-profile/gallery',
            isPro: true,
          },
        ],
      },

      {
        name: 'User Profile V2',
        id: uniqueId(),
        icon: 'solar:dropper-minimalistic-2-outline',
        children: [
          {
            id: uniqueId(),
            name: 'Profile',
            url: 'https://spike-react-tailwind-main.netlify.app/apps/user-profile/profiletwo',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Teams',
            url: 'https://spike-react-tailwind-main.netlify.app/apps/user-profile/teams',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Projects',
            url: 'https://spike-react-tailwind-main.netlify.app/apps/user-profile/projects',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Connections',
            url: 'https://spike-react-tailwind-main.netlify.app/apps/user-profile/connections',
            isPro: true,
          },
        ],
      },

      {
        name: 'Invoice',
        id: uniqueId(),
        icon: 'solar:bill-check-outline',
        children: [
          {
            id: uniqueId(),
            name: 'List',
            url: 'https://spike-react-tailwind-main.netlify.app/apps/invoice/list',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Details',
            url: 'https://spike-react-tailwind-main.netlify.app/apps/invoice/detail/PineappleInc',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Create',
            url: 'https://spike-react-tailwind-main.netlify.app/apps/invoice/create',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Edit',
            url: 'https://spike-react-tailwind-main.netlify.app/apps/invoice/edit/PineappleInc',
            isPro: true,
          },
        ],
      },
      {
        name: 'Ecommerce',
        id: uniqueId(),
        icon: 'solar:cart-3-line-duotone',
        children: [
          {
            id: uniqueId(),
            name: 'Shop One',
            url: 'https://spike-react-tailwind-main.netlify.app/apps/ecommerce/shop',
            isPro: true,
          },

          {
            id: uniqueId(),
            name: 'Shop Two',
            url: 'https://spike-react-tailwind-main.netlify.app/apps/ecommerce/shop2',
            isPro: true,
          },

          {
            id: uniqueId(),
            name: 'Details One',
            url: 'https://spike-react-tailwind-main.netlify.app/apps/ecommerce/detail/3',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Details Two',
            url: 'https://spike-react-tailwind-main.netlify.app/apps/ecommerce/detail-two/3',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'List',
            url: 'https://spike-react-tailwind-main.netlify.app/apps/ecommerce/list',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Checkout',
            url: 'https://spike-react-tailwind-main.netlify.app/apps/ecommerce/checkout',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Add Product',
            url: 'https://spike-react-tailwind-main.netlify.app/apps/ecommerce/addproduct',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Edit Product',
            url: 'https://spike-react-tailwind-main.netlify.app/apps/ecommerce/editproduct',
            isPro: true,
          },
        ],
      },
      {
        name: 'Blogs',
        id: uniqueId(),
        icon: 'solar:widget-add-line-duotone',
        children: [
          {
            id: uniqueId(),
            name: 'Blog Post',
            url: 'https://spike-react-tailwind-main.netlify.app/apps/blog/post',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Blog Detail',
            url: 'https://spike-react-tailwind-main.netlify.app/apps/blog/detail/streaming-video-way-before-it-was-cool-go-dark-tomorrow',
            isPro: true,
          },
        ],
      },
    ],
  },

  {
    heading: 'Pages',
    children: [
      {
        name: 'Pages',
        icon: 'solar:settings-minimalistic-line-duotone',
        id: uniqueId(),
        url: 'https://spike-react-tailwind-main.netlify.app/theme-pages/account-settings',
        children: [
          {
            name: 'Account Setting',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/theme-pages/account-settings',
            isPro: true,
          },
          {
            name: 'FAQ',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/theme-pages/faq',
            isPro: true,
          },
          {
            name: 'Pricing',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/theme-pages/pricing',
            isPro: true,
          },

          {
            name: 'Roll Base Access',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/theme-pages/casl',
            isPro: true,
          },
          {
            name: 'Landingpage',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/landingpage',
            isPro: true,
          },
        ],
      },
    ],
  },
  {
    heading: 'Widgets',
    children: [
      {
        id: uniqueId(),
        name: 'Cards',
        icon: 'solar:cardholder-line-duotone',
        url: 'https://spike-react-tailwind-main.netlify.app/widgets/cards',
        isPro: true,
      },
      {
        id: uniqueId(),
        name: 'Banners',
        icon: 'solar:align-vertical-spacing-line-duotone',
        url: 'https://spike-react-tailwind-main.netlify.app/widgets/banners',
        isPro: true,
      },
      {
        id: uniqueId(),
        name: 'Charts',
        icon: 'solar:chart-square-line-duotone',
        url: 'https://spike-react-tailwind-main.netlify.app/widgets/charts',
        isPro: true,
      },
    ],
  },
  {
    heading: 'Flowbite Ui',
    children: [
      {
        name: 'Ui Elements',
        id: uniqueId(),
        icon: 'solar:cpu-bolt-line-duotone',
        children: [
          {
            id: uniqueId(),
            name: 'Accordian',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/accordion',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Badge',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/badge',
            isPro: true,
          },

          {
            id: uniqueId(),
            name: 'Dropdowns',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/dropdown',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Modals',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/modals',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Tab',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/tab',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Tooltip',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/tooltip',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Alert',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/alert',
            isPro: true,
          },

          {
            id: uniqueId(),
            name: 'Breadcrumbs',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/breadcrumb',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Drawer',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/drawer',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Lists',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/listgroup',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Carousel',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/carousel',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Spinner',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/spinner',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Avatar',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/avatar',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Banner',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/banner',
            isPro: true,
          },

          {
            id: uniqueId(),
            name: 'Card',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/card',
            isPro: true,
          },

          {
            id: uniqueId(),
            name: 'Footer',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/footer',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'KBD',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/kbd',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Mega Menu',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/megamenu',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Navbar',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/navbar',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Popover',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/popover',
            isPro: true,
          },

          {
            id: uniqueId(),
            name: 'Sidebar',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/sidebar',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Tables',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/tables',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Timeline',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/timeline',
            isPro: true,
          },

          {
            id: uniqueId(),
            name: 'Typography',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/typography',
            isPro: true,
          },
        ],
      },
      {
        name: 'Form Elements',
        id: uniqueId(),
        icon: 'solar:notes-line-duotone',
        children: [
          {
            id: uniqueId(),
            name: 'Button',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/buttons',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Button Group',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/button-group',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Toast',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/toast',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Rating',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/rating',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Datepicker',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/datepicker',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Progressbar',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/progressbar',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Pagination',
            url: 'https://spike-react-tailwind-main.netlify.app/ui-components/pagination',
            isPro: true,
          },
        ],
      },
    ],
  },

  {
    heading: 'Headless Ui',
    children: [
      {
        name: 'Ui Elements',
        id: uniqueId(),
        icon: 'solar:text-underline-cross-broken',
        children: [
          {
            name: 'Dropdown',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/headless-ui/dropdown',
            isPro: true,
          },
          {
            name: 'Disclosure',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/headless-ui/disclosure',
            isPro: true,
          },
          {
            name: 'Dialog',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/headless-ui/dialog',
            isPro: true,
          },
          {
            name: 'Popover',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/headless-ui/popover',
            isPro: true,
          },
          {
            name: 'Tabs',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/headless-ui/tabs',
            isPro: true,
          },
          {
            name: 'Transition',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/headless-ui/transition',
            isPro: true,
          },
        ],
      },
      {
        name: 'Form Elements',
        id: uniqueId(),
        icon: 'solar:align-vertical-spacing-line-duotone',
        children: [
          {
            id: uniqueId(),
            name: 'Buttons',
            url: 'https://spike-react-tailwind-main.netlify.app/headless-form/buttons',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Checkbox',
            url: 'https://spike-react-tailwind-main.netlify.app/headless-form/checkbox',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Combobox',
            url: 'https://spike-react-tailwind-main.netlify.app/headless-form/combobox',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Fieldset',
            url: 'https://spike-react-tailwind-main.netlify.app/headless-form/fieldset',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Input',
            url: 'https://spike-react-tailwind-main.netlify.app/headless-form/input',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Listbox',
            url: 'https://spike-react-tailwind-main.netlify.app/headless-form/listbox',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Radio Group',
            url: 'https://spike-react-tailwind-main.netlify.app/headless-form/radiogroup',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Select',
            url: 'https://spike-react-tailwind-main.netlify.app/headless-form/select',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Switch',
            url: 'https://spike-react-tailwind-main.netlify.app/headless-form/switch',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Textarea',
            url: 'https://spike-react-tailwind-main.netlify.app/headless-form/textarea',
            isPro: true,
          },
        ],
      },
    ],
  },

  {
    heading: 'Shadcn Ui',
    children: [
      {
        name: 'Ui Elements',
        id: uniqueId(),
        icon: 'solar:adhesive-plaster-outline',
        children: [
          {
            id: uniqueId(),
            name: 'Badge',
            url: 'https://spike-react-tailwind-main.netlify.app/shadcn-ui/badge',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Button',
            url: 'https://spike-react-tailwind-main.netlify.app/shadcn-ui/buttons',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Dropdowns',
            url: 'https://spike-react-tailwind-main.netlify.app/shadcn-ui/dropdown',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Dialogs',
            url: 'https://spike-react-tailwind-main.netlify.app/shadcn-ui/dialogs',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Alert',
            url: 'https://spike-react-tailwind-main.netlify.app/shadcn-ui/alert',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Toast',
            url: 'https://spike-react-tailwind-main.netlify.app/shadcn-ui/toast',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Breadcrumbs',
            url: 'https://spike-react-tailwind-main.netlify.app/shadcn-ui/breadcrumb',
            isPro: true,
          },

          {
            id: uniqueId(),
            name: 'Carousel',
            url: 'https://spike-react-tailwind-main.netlify.app/shadcn-ui/carousel',
            isPro: true,
          },

          {
            id: uniqueId(),
            name: 'Card',
            url: 'https://spike-react-tailwind-main.netlify.app/shadcn-ui/card',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Datepicker',
            url: 'https://spike-react-tailwind-main.netlify.app/shadcn-ui/datepicker',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Combobox',
            url: 'https://spike-react-tailwind-main.netlify.app/shadcn-ui/combobox',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Collapsible',
            url: 'https://spike-react-tailwind-main.netlify.app/shadcn-ui/collapsible',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Command',
            url: 'https://spike-react-tailwind-main.netlify.app/shadcn-ui/command',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Skeleton',
            url: 'https://spike-react-tailwind-main.netlify.app/shadcn-ui/skeleton',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Avatar',
            url: 'https://spike-react-tailwind-main.netlify.app/shadcn-ui/avatar',
            isPro: true,
          },

          {
            id: uniqueId(),
            name: 'Tooltip',
            url: 'https://spike-react-tailwind-main.netlify.app/shadcn-ui/tooltip',
            isPro: true,
          },
          {
            name: 'Accordion',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/shadcn-ui/accordion',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Tab',
            url: 'https://spike-react-tailwind-main.netlify.app/shadcn-ui/tab',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Progressbar',
            url: 'https://spike-react-tailwind-main.netlify.app/shadcn-ui/progressbar',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Drawer',
            url: 'https://spike-react-tailwind-main.netlify.app/shadcn-ui/drawer',
            isPro: true,
          },
        ],
      },
      {
        name: 'Form Elements',
        id: uniqueId(),
        icon: 'solar:widget-6-line-duotone',
        children: [
          {
            id: uniqueId(),
            name: 'Input',
            url: 'https://spike-react-tailwind-main.netlify.app/shadcn-form/input',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Select',
            url: 'https://spike-react-tailwind-main.netlify.app/shadcn-form/select',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Checkbox',
            url: 'https://spike-react-tailwind-main.netlify.app/shadcn-form/checkbox',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Radio',
            url: 'https://spike-react-tailwind-main.netlify.app/shadcn-form/radio',
            isPro: true,
          },
        ],
      },
    ],
  },

  {
    heading: 'Tables',
    children: [
      {
        name: 'Basic Tables',
        icon: 'solar:tablet-line-duotone',
        id: uniqueId(),
        url: 'https://spike-react-tailwind-main.netlify.app/tables/basic',
        isPro: true,
      },
      {
        name: 'Striped Rows Table',
        icon: 'solar:tablet-line-duotone',
        id: uniqueId(),
        url: 'https://spike-react-tailwind-main.netlify.app/tables/striped-row',
        isPro: true,
      },
      {
        name: 'Hover Table',
        icon: 'solar:tablet-line-duotone',
        id: uniqueId(),
        url: 'https://spike-react-tailwind-main.netlify.app/tables/hover-table',
        isPro: true,
      },
      {
        name: 'Checkbox Table',
        icon: 'solar:tablet-line-duotone',
        id: uniqueId(),
        url: 'https://spike-react-tailwind-main.netlify.app/tables/checkbox-table',
        isPro: true,
      },
    ],
  },

  {
    heading: 'Shadcn Table',
    children: [
      {
        name: 'Basic Table',
        id: uniqueId(),
        icon: 'solar:command-line-duotone',
        url: 'https://spike-react-tailwind-main.netlify.app/shadcn-tables/basic',
        isPro: true,
      },
    ],
  },

  {
    heading: 'React Tables',
    children: [
      {
        id: uniqueId(),
        name: 'React Tables',
        icon: 'solar:round-transfer-vertical-broken',
        url: 'https://spike-react-tailwind-main.netlify.app/react-tables/basic',
        children: [
          {
            id: uniqueId(),
            name: 'Basic',
            url: 'https://spike-react-tailwind-main.netlify.app/react-tables/basic',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Dense',
            url: 'https://spike-react-tailwind-main.netlify.app/react-tables/dense',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Sorting',
            url: 'https://spike-react-tailwind-main.netlify.app/react-tables/sorting',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Filtering',
            url: 'https://spike-react-tailwind-main.netlify.app/react-tables/filtering',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Pagination',
            url: 'https://spike-react-tailwind-main.netlify.app/react-tables/pagination',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Row Selection',
            url: 'https://spike-react-tailwind-main.netlify.app/react-tables/row-selection',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Column Visibility',
            url: 'https://spike-react-tailwind-main.netlify.app/react-tables/columnvisibility',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Editable',
            url: 'https://spike-react-tailwind-main.netlify.app/react-tables/editable',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Sticky',
            url: 'https://spike-react-tailwind-main.netlify.app/react-tables/sticky',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Drag & Drop',
            url: 'https://spike-react-tailwind-main.netlify.app/react-tables/drag-drop',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Empty',
            url: 'https://spike-react-tailwind-main.netlify.app/react-tables/empty',
            isPro: true,
          },
          {
            id: uniqueId(),
            name: 'Expanding',
            url: 'https://spike-react-tailwind-main.netlify.app/react-tables/expanding',
            isPro: true,
          },
        ],
      },
    ],
  },
  {
    heading: 'Charts',
    children: [
      {
        name: 'Line Chart',
        icon: 'solar:chart-square-line-duotone',
        id: uniqueId(),
        url: 'https://spike-react-tailwind-main.netlify.app/charts/line',
        isPro: true,
      },
      {
        name: 'Area Chart',
        icon: 'solar:graph-new-broken',
        id: uniqueId(),
        url: 'https://spike-react-tailwind-main.netlify.app/charts/area',
        isPro: true,
      },
      {
        name: 'Gradient Chart',
        icon: 'solar:round-graph-outline',
        id: uniqueId(),
        url: 'https://spike-react-tailwind-main.netlify.app/charts/gradient',
        isPro: true,
      },
      {
        name: 'Candlestick',
        icon: 'solar:chandelier-outline',
        id: uniqueId(),
        url: 'https://spike-react-tailwind-main.netlify.app/charts/candlestick',
        isPro: true,
      },
      {
        name: 'Column',
        icon: 'solar:chart-2-bold-duotone',
        id: uniqueId(),
        url: 'https://spike-react-tailwind-main.netlify.app/charts/column',
        isPro: true,
      },
      {
        name: 'Doughnut & Pie',
        icon: 'solar:pie-chart-2-linear',
        id: uniqueId(),
        url: 'https://spike-react-tailwind-main.netlify.app/charts/doughnut',
        isPro: true,
      },
      {
        name: 'Radialbar & Radar',
        icon: 'solar:graph-line-duotone',
        id: uniqueId(),
        url: 'https://spike-react-tailwind-main.netlify.app/charts/radialbar',
        isPro: true,
      },
    ],
  },
  {
    heading: 'Forms',
    children: [
      {
        id: uniqueId(),
        name: 'Forms Elements',
        icon: 'solar:text-selection-line-duotone',
        url: 'https://spike-react-tailwind-main.netlify.app/forms/form-elements',
        isPro: true,
      },
      {
        id: uniqueId(),
        name: 'Forms Layouts',
        icon: 'solar:document-text-outline',
        url: 'https://spike-react-tailwind-main.netlify.app/forms/form-layouts',
        isPro: true,
      },
      {
        id: uniqueId(),
        name: 'Forms Horizontal',
        icon: 'solar:slider-horizontal-line-duotone',
        url: 'https://spike-react-tailwind-main.netlify.app/forms/form-horizontal',
        isPro: true,
      },
      {
        id: uniqueId(),
        name: 'Forms Vertical',
        icon: 'solar:slider-vertical-line-duotone',
        url: 'https://spike-react-tailwind-main.netlify.app/forms/form-vertical',
        isPro: true,
      },
      {
        id: uniqueId(),
        name: 'Forms Custom',
        icon: 'solar:document-text-outline',
        url: 'https://spike-react-tailwind-main.netlify.app/forms/form-custom',
        isPro: true,
      },
      {
        id: uniqueId(),
        name: 'Form Validation',
        icon: 'solar:bill-check-linear',
        url: 'https://spike-react-tailwind-main.netlify.app/forms/form-validation',
        isPro: true,
      },
    ],
  },
  {
    heading: 'Auth',
    children: [
      {
        name: 'Login',
        icon: 'solar:login-2-linear',
        id: uniqueId(),
        url: '/auth/login',
        isPro: false,
      },
      {
        name: 'Register',
        icon: 'solar:shield-user-outline',
        id: uniqueId(),
        url: '/auth/register',
        isPro: false,
      },

      {
        name: 'Auth Pages',
        icon: 'solar:login-2-linear',
        id: uniqueId(),
        url: '',
        children: [
          {
            name: 'Error',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/auth/error',
            isPro: true,
          },
          {
            name: 'Side Login',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/auth/auth1/login',
            isPro: true,
          },
          {
            name: 'Boxed Login',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/auth/auth2/login',
            isPro: true,
          },
          {
            name: 'Side Register',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/auth/auth1/register',
            isPro: true,
          },
          {
            name: 'Boxed Register',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/auth/auth2/register',
            isPro: true,
          },
          {
            name: 'Side Forgot Pwd',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/auth/auth1/forgot-password',
            isPro: true,
          },
          {
            name: 'Boxed Forgot Pwd',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/auth/auth2/forgot-password',
            isPro: true,
          },
          {
            name: 'Side Two Steps',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/auth/auth1/two-steps',
            isPro: true,
          },
          {
            name: 'Boxed Two Steps',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/auth/auth2/two-steps',
            isPro: true,
          },
          {
            name: 'Maintenance',
            id: uniqueId(),
            url: 'https://spike-react-tailwind-main.netlify.app/auth/maintenance',
            isPro: true,
          },
        ],
      },
    ],
  },
  {
    heading: 'Extra',
    children: [
      {
        id: uniqueId(),
        name: 'Solar Icons',
        icon: 'solar:sticker-smile-circle-outline',
        url: '/icons/solar',
        isPro: true,
      },
      {
        name: 'Sample Page',
        icon: 'solar:planet-3-line-duotone',
        id: uniqueId(),
        url: '/sample-page',
        isPro: false,
      },
    ],
  },
];

export default SidebarContent;
