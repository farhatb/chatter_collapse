{
    'name': 'Chatter Collapse',
    'version': '17.0.2.1.0',
    'category': 'Tools',
    'summary': 'Make chatter collapsible and closed by default',
    'description': """
        This module enhances the Odoo chatter functionality by making it collapsible.
        The chatter will be closed by default and can be opened when needed.
        
        Features:
        - Collapsible chatter with smooth animations
        - Closed by default to save screen space
        - Toggle button to expand/collapse
        - Maintains functionality when expanded
    """,
    'author': 'Farhat Boujlida',
    'depends': ['mail', 'web'],
    'data': [
        'views/assets.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'chatter_collapse/static/src/js/chatter_collapse.js',
            'chatter_collapse/static/src/css/chatter_collapse.css',
        ],
    },
    'images': ['static/description/banner.png'],
    'installable': True,
    'application': False,
    'auto_install': False,
    'license': 'LGPL-3',
}
